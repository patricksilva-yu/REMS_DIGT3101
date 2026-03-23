package com.rems.backend.service;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.RentalApplication;
import com.rems.backend.domain.enums.ApplicationStatus;
import com.rems.backend.domain.enums.NotificationType;
import com.rems.backend.domain.enums.UnitStatus;
import com.rems.backend.dto.CreateRentalApplicationRequest;
import com.rems.backend.dto.ReviewApplicationRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.RentalApplicationRepository;
import com.rems.backend.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final RentalApplicationRepository rentalApplicationRepository;
    private final UnitRepository unitRepository;
    private final LeaseService leaseService;
    private final NotificationService notificationService;

    public ApplicationService(
        RentalApplicationRepository rentalApplicationRepository,
        UnitRepository unitRepository,
        LeaseService leaseService,
        NotificationService notificationService
    ) {
        this.rentalApplicationRepository = rentalApplicationRepository;
        this.unitRepository = unitRepository;
        this.leaseService = leaseService;
        this.notificationService = notificationService;
    }

    public List<RentalApplication> listApplications() {
        return rentalApplicationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public RentalApplication createApplication(CreateRentalApplicationRequest request) {
        var unit = unitRepository.findById(request.unitId())
            .orElseThrow(() -> new NotFoundException("Unit not found."));

        RentalApplication application = new RentalApplication();
        application.setUnitId(request.unitId());
        application.setApplicantName(request.applicantName());
        application.setApplicantEmail(request.applicantEmail());
        application.setApplicantPhone(request.applicantPhone());
        application.setBusinessType(request.businessType());
        application.setContactPerson(request.contactPerson());
        application.setRequestedCycle(request.requestedCycle());
        application.setNotes(request.notes());

        RentalApplication saved = rentalApplicationRepository.save(application);
        notificationService.notify(
            UUID.fromString("00000000-0000-0000-0000-000000000002"),
            NotificationType.APPLICATION,
            "New application received",
            "A new rental application was submitted for unit " + unit.getUnitNumber() + "."
        );
        return saved;
    }

    @Transactional
    public Object reviewApplication(UUID applicationId, ReviewApplicationRequest request) {
        RentalApplication application = rentalApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new NotFoundException("Application not found."));

        application.setReviewedAt(OffsetDateTime.now());
        application.setReviewedBy(request.reviewerId());
        application.setNotes(request.notes());

        if (request.approved()) {
            application.setStatus(ApplicationStatus.APPROVED);
            RentalApplication saved = rentalApplicationRepository.save(application);
            Lease lease = leaseService.createLeaseFromApplication(saved, request);

            var unit = unitRepository.findById(saved.getUnitId()).orElseThrow(() -> new NotFoundException("Unit not found."));
            unit.setStatus(UnitStatus.OCCUPIED);
            unitRepository.save(unit);
            return lease;
        }

        application.setStatus(ApplicationStatus.REJECTED);
        return rentalApplicationRepository.save(application);
    }
}
