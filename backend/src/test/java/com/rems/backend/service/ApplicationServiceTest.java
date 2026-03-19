package com.rems.backend.service;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.RentalApplication;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.enums.ApplicationStatus;
import com.rems.backend.domain.enums.PaymentCycle;
import com.rems.backend.domain.enums.UnitStatus;
import com.rems.backend.dto.CreateRentalApplicationRequest;
import com.rems.backend.dto.ReviewApplicationRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.RentalApplicationRepository;
import com.rems.backend.repository.UnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private RentalApplicationRepository rentalApplicationRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private LeaseService leaseService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    void createApplicationRejectsMissingUnit() {
        UUID unitId = UUID.randomUUID();
        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        CreateRentalApplicationRequest request = new CreateRentalApplicationRequest(
            unitId,
            "North Star Apparel",
            "leasing@northstar.com",
            "416-555-2100",
            "Retail",
            "Alicia Stone",
            PaymentCycle.QUARTERLY,
            "Test"
        );

        assertThatThrownBy(() -> applicationService.createApplication(request))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Unit not found");
    }

    @Test
    void createApplicationPersistsSubmittedApplication() {
        UUID unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setUnitNumber("A2");
        unit.setBaseRent(BigDecimal.valueOf(3900));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(rentalApplicationRepository.save(any(RentalApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRentalApplicationRequest request = new CreateRentalApplicationRequest(
            unitId,
            "North Star Apparel",
            "leasing@northstar.com",
            "416-555-2100",
            "Retail",
            "Alicia Stone",
            PaymentCycle.QUARTERLY,
            "High-traffic unit"
        );

        RentalApplication saved = applicationService.createApplication(request);

        assertThat(saved.getApplicantEmail()).isEqualTo("leasing@northstar.com");
        assertThat(saved.getRequestedCycle()).isEqualTo(PaymentCycle.QUARTERLY);
        assertThat(saved.getStatus()).isEqualTo(ApplicationStatus.SUBMITTED);
        verify(notificationService).notify(
            UUID.fromString("00000000-0000-0000-0000-000000000002"),
            com.rems.backend.domain.enums.NotificationType.APPLICATION,
            "New application received",
            "A new rental application was submitted for unit A2."
        );
    }

    @Test
    void reviewApplicationApprovesAndCreatesLease() {
        UUID applicationId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();

        RentalApplication application = new RentalApplication();
        application.setId(applicationId);
        application.setUnitId(unitId);
        application.setApplicantEmail("leasing@northstar.com");
        application.setRequestedCycle(PaymentCycle.MONTHLY);

        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setStatus(UnitStatus.AVAILABLE);

        Lease lease = new Lease();
        lease.setId(UUID.randomUUID());

        when(rentalApplicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(rentalApplicationRepository.save(any(RentalApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(leaseService.createLeaseFromApplication(any(RentalApplication.class), any(ReviewApplicationRequest.class))).thenReturn(lease);

        Object result = applicationService.reviewApplication(
            applicationId,
            new ReviewApplicationRequest(reviewerId, true, "Approved", LocalDate.of(2026, 4, 1), null, null, true, null)
        );

        assertThat(result).isSameAs(lease);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPROVED);
        assertThat(application.getReviewedBy()).isEqualTo(reviewerId);
        assertThat(unit.getStatus()).isEqualTo(UnitStatus.OCCUPIED);
    }

    @Test
    void reviewApplicationRejectsWithoutCreatingLease() {
        UUID applicationId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        RentalApplication application = new RentalApplication();
        application.setId(applicationId);
        application.setUnitId(UUID.randomUUID());

        when(rentalApplicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(rentalApplicationRepository.save(any(RentalApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Object result = applicationService.reviewApplication(
            applicationId,
            new ReviewApplicationRequest(reviewerId, false, "Insufficient fit", null, null, null, null, null)
        );

        assertThat(result).isInstanceOf(RentalApplication.class);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        verify(leaseService, org.mockito.Mockito.never()).createLeaseFromApplication(any(), any());
    }
}
