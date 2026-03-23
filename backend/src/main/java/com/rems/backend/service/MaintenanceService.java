package com.rems.backend.service;

import com.rems.backend.domain.MaintenanceEvent;
import com.rems.backend.domain.MaintenanceRequest;
import com.rems.backend.domain.enums.MaintenanceStatus;
import com.rems.backend.domain.enums.MaintenanceUrgency;
import com.rems.backend.domain.enums.NotificationType;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.CreateMaintenanceRequest;
import com.rems.backend.dto.UpdateMaintenanceStatusRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.MaintenanceEventRepository;
import com.rems.backend.repository.MaintenanceRequestRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MaintenanceEventRepository maintenanceEventRepository;
    private final UserAccountRepository userAccountRepository;
    private final UnitRepository unitRepository;
    private final LeaseRepository leaseRepository;
    private final BillingService billingService;
    private final NotificationService notificationService;

    public MaintenanceService(
        MaintenanceRequestRepository maintenanceRequestRepository,
        MaintenanceEventRepository maintenanceEventRepository,
        UserAccountRepository userAccountRepository,
        UnitRepository unitRepository,
        LeaseRepository leaseRepository,
        BillingService billingService,
        NotificationService notificationService
    ) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.maintenanceEventRepository = maintenanceEventRepository;
        this.userAccountRepository = userAccountRepository;
        this.unitRepository = unitRepository;
        this.leaseRepository = leaseRepository;
        this.billingService = billingService;
        this.notificationService = notificationService;
    }

    public List<MaintenanceRequest> listRequests() {
        return maintenanceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceEvent> listEvents(UUID requestId) {
        return maintenanceEventRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
    }

    @Transactional
    public MaintenanceRequest createRequest(CreateMaintenanceRequest request) {
        userAccountRepository.findById(request.tenantId()).orElseThrow(() -> new NotFoundException("Tenant not found."));
        unitRepository.findById(request.unitId()).orElseThrow(() -> new NotFoundException("Unit not found."));
        if (request.leaseId() != null) {
            leaseRepository.findById(request.leaseId()).orElseThrow(() -> new NotFoundException("Lease not found."));
        }

        MaintenanceRequest maintenanceRequest = new MaintenanceRequest();
        maintenanceRequest.setTenantId(request.tenantId());
        maintenanceRequest.setUnitId(request.unitId());
        maintenanceRequest.setLeaseId(request.leaseId());
        maintenanceRequest.setCategory(request.category());
        maintenanceRequest.setDescription(request.description());
        maintenanceRequest.setUrgency(request.urgency());
        maintenanceRequest.setMisuseCaused(request.misuseCaused());
        maintenanceRequest.setMisuseChargeAmount(
            request.misuseCaused() && request.misuseChargeAmount() != null ? request.misuseChargeAmount() : BigDecimal.ZERO
        );
        maintenanceRequest.setEscalated(
            request.urgency() == MaintenanceUrgency.HIGH || request.urgency() == MaintenanceUrgency.CRITICAL
        );

        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenanceRequest);
        createEvent(saved.getId(), "CREATED", "Request created via portal.");
        if (saved.isEscalated()) {
            createEvent(saved.getId(), "ESCALATED", "Marked for urgent handling.");
        }

        userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.MAINTENANCE_STAFF).forEach(user ->
            notificationService.notify(
                user.getId(),
                NotificationType.MAINTENANCE,
                "Maintenance request submitted",
                "A new maintenance request was submitted for unit " + saved.getUnitId() + "."
            )
        );
        return saved;
    }

    @Transactional
    public MaintenanceRequest updateStatus(UUID requestId, UpdateMaintenanceStatusRequest request) {
        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(requestId)
            .orElseThrow(() -> new NotFoundException("Maintenance request not found."));

        maintenanceRequest.setStatus(request.status());
        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenanceRequest);
        createEvent(saved.getId(), request.status().name(), request.notes() != null ? request.notes() : "Status updated.");

        if (request.status() == MaintenanceStatus.COMPLETED) {
            billingService.attachMaintenanceCharge(saved);
            notificationService.notify(
                saved.getTenantId(),
                NotificationType.MAINTENANCE,
                "Maintenance request completed",
                "Request " + saved.getId() + " was completed."
            );
        }
        return saved;
    }

    private void createEvent(UUID requestId, String eventType, String notes) {
        MaintenanceEvent event = new MaintenanceEvent();
        event.setRequestId(requestId);
        event.setEventType(eventType);
        event.setNotes(notes);
        maintenanceEventRepository.save(event);
    }
}
