package com.rems.backend.service;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.MaintenanceEvent;
import com.rems.backend.domain.MaintenanceRequest;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.UserAccount;
import com.rems.backend.domain.enums.MaintenanceCategory;
import com.rems.backend.domain.enums.MaintenanceStatus;
import com.rems.backend.domain.enums.MaintenanceUrgency;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.CreateMaintenanceRequest;
import com.rems.backend.dto.UpdateMaintenanceStatusRequest;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.MaintenanceEventRepository;
import com.rems.backend.repository.MaintenanceRequestRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private MaintenanceEventRepository maintenanceEventRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private LeaseRepository leaseRepository;

    @Mock
    private BillingService billingService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MaintenanceService maintenanceService;

    @Test
    void createRequestEscalatesHighUrgencyAndCreatesTwoEvents() {
        UUID tenantId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UserAccount technician = new UserAccount();
        technician.setId(UUID.randomUUID());
        technician.setRole(UserRole.MAINTENANCE_STAFF);

        when(userAccountRepository.findById(tenantId)).thenReturn(Optional.of(new UserAccount()));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        when(userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.MAINTENANCE_STAFF)).thenReturn(List.of(technician));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(invocation -> {
            MaintenanceRequest request = invocation.getArgument(0);
            if (request.getId() == null) {
                request.setId(UUID.randomUUID());
            }
            return request;
        });
        when(maintenanceEventRepository.save(any(MaintenanceEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceRequest saved = maintenanceService.createRequest(
            new CreateMaintenanceRequest(
                tenantId,
                unitId,
                null,
                MaintenanceCategory.HVAC,
                "Cooling outage",
                MaintenanceUrgency.HIGH,
                false,
                null
            )
        );

        assertThat(saved.isEscalated()).isTrue();
        assertThat(saved.getMisuseChargeAmount()).isEqualByComparingTo("0");
        verify(maintenanceEventRepository, times(2)).save(any(MaintenanceEvent.class));
        verify(notificationService).notify(
            technician.getId(),
            com.rems.backend.domain.enums.NotificationType.MAINTENANCE,
            "Maintenance request submitted",
            "A new maintenance request was submitted for unit " + unitId + "."
        );
    }

    @Test
    void createRequestStoresMisuseChargeWhenProvided() {
        UUID tenantId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID leaseId = UUID.randomUUID();

        when(userAccountRepository.findById(tenantId)).thenReturn(Optional.of(new UserAccount()));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        when(leaseRepository.findById(leaseId)).thenReturn(Optional.of(new Lease()));
        when(userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.MAINTENANCE_STAFF)).thenReturn(List.of());
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(maintenanceEventRepository.save(any(MaintenanceEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceRequest saved = maintenanceService.createRequest(
            new CreateMaintenanceRequest(
                tenantId,
                unitId,
                leaseId,
                MaintenanceCategory.PLUMBING,
                "Sink backed up",
                MaintenanceUrgency.MEDIUM,
                true,
                BigDecimal.valueOf(175)
            )
        );

        assertThat(saved.isEscalated()).isFalse();
        assertThat(saved.getMisuseChargeAmount()).isEqualByComparingTo("175");
    }

    @Test
    void updateStatusCompletingRequestTriggersBillingAndTenantNotification() {
        UUID requestId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        MaintenanceRequest request = new MaintenanceRequest();
        request.setId(requestId);
        request.setTenantId(tenantId);

        when(maintenanceRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(maintenanceEventRepository.save(any(MaintenanceEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceRequest updated = maintenanceService.updateStatus(
            requestId,
            new UpdateMaintenanceStatusRequest(MaintenanceStatus.COMPLETED, "Resolved on site")
        );

        assertThat(updated.getStatus()).isEqualTo(MaintenanceStatus.COMPLETED);
        verify(billingService).attachMaintenanceCharge(updated);
        verify(notificationService).notify(
            tenantId,
            com.rems.backend.domain.enums.NotificationType.MAINTENANCE,
            "Maintenance request completed",
            "Request " + requestId + " was completed."
        );
    }
}
