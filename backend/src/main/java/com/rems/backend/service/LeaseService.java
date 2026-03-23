package com.rems.backend.service;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.PaymentCycleRate;
import com.rems.backend.domain.RentalApplication;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.UserAccount;
import com.rems.backend.domain.enums.LeaseStatus;
import com.rems.backend.domain.enums.NotificationType;
import com.rems.backend.domain.enums.UnitStatus;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.ReviewApplicationRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.RenewalPolicyRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class LeaseService {

    private final LeaseRepository leaseRepository;
    private final UnitRepository unitRepository;
    private final UserAccountRepository userAccountRepository;
    private final RenewalPolicyRepository renewalPolicyRepository;
    private final BillingService billingService;
    private final NotificationService notificationService;

    public LeaseService(
        LeaseRepository leaseRepository,
        UnitRepository unitRepository,
        UserAccountRepository userAccountRepository,
        RenewalPolicyRepository renewalPolicyRepository,
        BillingService billingService,
        NotificationService notificationService
    ) {
        this.leaseRepository = leaseRepository;
        this.unitRepository = unitRepository;
        this.userAccountRepository = userAccountRepository;
        this.renewalPolicyRepository = renewalPolicyRepository;
        this.billingService = billingService;
        this.notificationService = notificationService;
    }

    public List<Lease> listLeases() {
        return leaseRepository.findAllByOrderByStartDateDesc();
    }

    @Transactional
    public Lease createLeaseFromApplication(RentalApplication application, ReviewApplicationRequest request) {
        Unit unit = unitRepository.findById(application.getUnitId())
            .orElseThrow(() -> new NotFoundException("Unit not found."));

        UserAccount tenant = userAccountRepository.findByEmailIgnoreCase(application.getApplicantEmail())
            .orElseGet(() -> {
                UserAccount user = new UserAccount();
                user.setFullName(application.getApplicantName());
                user.setEmail(application.getApplicantEmail());
                user.setPassword("demo123");
                user.setRole(UserRole.TENANT);
                user.setCompanyName(application.getApplicantName());
                user.setBusinessType(application.getBusinessType());
                user.setPhone(application.getApplicantPhone());
                user.setContactPerson(application.getContactPerson());
                return userAccountRepository.save(user);
            });

        PaymentCycleRate cycleRate = billingService.getCycleRate(application.getRequestedCycle());

        Lease lease = new Lease();
        lease.setTenantId(tenant.getId());
        lease.setUnitId(unit.getId());
        lease.setPropertyId(unit.getPropertyId());
        lease.setApplicationId(application.getId());
        lease.setStartDate(request.startDate() != null ? request.startDate() : LocalDate.now());
        lease.setEndDate(request.endDate() != null ? request.endDate() : lease.getStartDate().plusMonths(12).minusDays(1));
        lease.setPaymentCycle(application.getRequestedCycle());
        lease.setCycleMultiplier(cycleRate.getMultiplier());
        lease.setDiscountPercent(BigDecimal.ZERO);
        lease.setBaseRent(unit.getBaseRent());
        lease.setEffectiveRent(unit.getBaseRent().multiply(cycleRate.getMultiplier()).setScale(2, RoundingMode.HALF_UP));
        lease.setDepositAmount(request.depositAmount() != null ? request.depositAmount() : unit.getBaseRent().multiply(BigDecimal.valueOf(2)));
        lease.setAutoRenew(request.autoRenew() == null || request.autoRenew());
        lease.setStatus(LeaseStatus.ACTIVE);
        if (request.renewalPolicyId() != null) {
            renewalPolicyRepository.findById(request.renewalPolicyId())
                .orElseThrow(() -> new NotFoundException("Renewal policy not found."));
            lease.setRenewalPolicyId(request.renewalPolicyId());
        }

        Lease saved = leaseRepository.save(lease);
        BigDecimal discountPercent = billingService.resolveDiscountPercent(tenant.getId());
        saved.setDiscountPercent(discountPercent);
        BigDecimal discountedMonthlyRent = unit.getBaseRent()
            .multiply(cycleRate.getMultiplier())
            .multiply(BigDecimal.ONE.subtract(discountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
            .setScale(2, RoundingMode.HALF_UP);
        saved.setEffectiveRent(discountedMonthlyRent);
        saved = leaseRepository.save(saved);

        unit.setStatus(UnitStatus.OCCUPIED);
        unitRepository.save(unit);

        billingService.generateInvoiceForLease(saved, saved.getStartDate().withDayOfMonth(1));
        notificationService.notify(
            tenant.getId(),
            NotificationType.LEASE,
            "Lease approved",
            "Your application for unit " + unit.getUnitNumber() + " has been approved."
        );
        return saved;
    }

    @Transactional
    public void processAutoRenewals() {
        List<Lease> expiringLeases = leaseRepository.findByStatusAndEndDateBetween(
            LeaseStatus.ACTIVE,
            LocalDate.now(),
            LocalDate.now().plusDays(1)
        );

        for (Lease lease : expiringLeases) {
            if (!lease.isAutoRenew() || lease.getRenewalPolicyId() == null) {
                continue;
            }

            var policy = renewalPolicyRepository.findById(lease.getRenewalPolicyId()).orElse(null);
            if (policy == null || !policy.isEnabled()) {
                continue;
            }

            lease.setEndDate(lease.getEndDate().plusMonths(policy.getRenewalTermMonths()));
            leaseRepository.save(lease);
            notificationService.notify(
                lease.getTenantId(),
                NotificationType.LEASE,
                "Lease renewed",
                "Lease " + lease.getId() + " was automatically renewed for " + policy.getRenewalTermMonths() + " months."
            );
        }
    }
}
