package com.rems.backend.service;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.RenewalPolicy;
import com.rems.backend.domain.enums.LeaseStatus;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.RenewalPolicyRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaseServiceTest {

    @Mock
    private LeaseRepository leaseRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private RenewalPolicyRepository renewalPolicyRepository;

    @Mock
    private BillingService billingService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LeaseService leaseService;

    @Test
    void processAutoRenewalsExtendsEligibleLease() {
        UUID tenantId = UUID.randomUUID();
        UUID policyId = UUID.randomUUID();
        Lease lease = new Lease();
        lease.setId(UUID.randomUUID());
        lease.setTenantId(tenantId);
        lease.setStatus(LeaseStatus.ACTIVE);
        lease.setAutoRenew(true);
        lease.setRenewalPolicyId(policyId);
        lease.setEndDate(LocalDate.now());

        RenewalPolicy policy = new RenewalPolicy();
        policy.setId(policyId);
        policy.setEnabled(true);
        policy.setRenewalTermMonths(12);

        when(leaseRepository.findByStatusAndEndDateBetween(LeaseStatus.ACTIVE, LocalDate.now(), LocalDate.now().plusDays(1)))
            .thenReturn(List.of(lease));
        when(renewalPolicyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(leaseRepository.save(any(Lease.class))).thenAnswer(invocation -> invocation.getArgument(0));

        leaseService.processAutoRenewals();

        assertThat(lease.getEndDate()).isEqualTo(LocalDate.now().plusMonths(12));
        verify(notificationService).notify(
            tenantId,
            com.rems.backend.domain.enums.NotificationType.LEASE,
            "Lease renewed",
            "Lease " + lease.getId() + " was automatically renewed for 12 months."
        );
    }

    @Test
    void processAutoRenewalsSkipsDisabledPolicy() {
        UUID policyId = UUID.randomUUID();
        Lease lease = new Lease();
        lease.setId(UUID.randomUUID());
        lease.setTenantId(UUID.randomUUID());
        lease.setStatus(LeaseStatus.ACTIVE);
        lease.setAutoRenew(true);
        lease.setRenewalPolicyId(policyId);
        lease.setEndDate(LocalDate.now());

        RenewalPolicy policy = new RenewalPolicy();
        policy.setId(policyId);
        policy.setEnabled(false);
        policy.setRenewalTermMonths(12);

        when(leaseRepository.findByStatusAndEndDateBetween(LeaseStatus.ACTIVE, LocalDate.now(), LocalDate.now().plusDays(1)))
            .thenReturn(List.of(lease));
        when(renewalPolicyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        leaseService.processAutoRenewals();

        assertThat(lease.getEndDate()).isEqualTo(LocalDate.now());
    }
}
