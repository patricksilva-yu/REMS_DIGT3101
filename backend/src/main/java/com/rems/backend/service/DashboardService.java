package com.rems.backend.service;

import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.Payment;
import com.rems.backend.domain.enums.InvoiceStatus;
import com.rems.backend.domain.enums.LeaseStatus;
import com.rems.backend.domain.enums.MaintenanceStatus;
import com.rems.backend.domain.enums.PaymentStatus;
import com.rems.backend.domain.enums.UnitStatus;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.DashboardResponse;
import com.rems.backend.repository.InvoiceRepository;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.MaintenanceRequestRepository;
import com.rems.backend.repository.PaymentRepository;
import com.rems.backend.repository.PropertyRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final PropertyRepository propertyRepository;
    private final UnitRepository unitRepository;
    private final LeaseRepository leaseRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserAccountRepository userAccountRepository;

    public DashboardService(
        PropertyRepository propertyRepository,
        UnitRepository unitRepository,
        LeaseRepository leaseRepository,
        MaintenanceRequestRepository maintenanceRequestRepository,
        PaymentRepository paymentRepository,
        InvoiceRepository invoiceRepository,
        UserAccountRepository userAccountRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.unitRepository = unitRepository;
        this.leaseRepository = leaseRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public DashboardResponse getSummary() {
        long totalUnits = unitRepository.count();
        long occupiedUnits = unitRepository.findAll().stream().filter(unit -> unit.getStatus() == UnitStatus.OCCUPIED).count();
        long occupancyRate = totalUnits == 0 ? 0 : Math.round((double) occupiedUnits * 100 / totalUnits);
        BigDecimal totalMonthlyRent = leaseRepository.findAll().stream()
            .filter(lease -> lease.getStatus() == LeaseStatus.ACTIVE)
            .map(lease -> lease.getEffectiveRent())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overdueAmount = invoiceRepository.findAll().stream()
            .filter(invoice -> invoice.getStatus() == InvoiceStatus.OVERDUE)
            .map(invoice -> outstandingForInvoice(invoice))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long openMaintenance = maintenanceRequestRepository.findAll().stream()
            .filter(request -> request.getStatus() == MaintenanceStatus.NEW || request.getStatus() == MaintenanceStatus.IN_PROGRESS)
            .count();

        long activeLeases = leaseRepository.findAll().stream().filter(lease -> lease.getStatus() == LeaseStatus.ACTIVE).count();
        long totalTenants = userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.TENANT).size();

        return new DashboardResponse(
            propertyRepository.count(),
            totalUnits,
            occupiedUnits,
            occupancyRate,
            unitRepository.findAll().stream().filter(unit -> unit.getStatus() == UnitStatus.AVAILABLE).count(),
            totalMonthlyRent,
            overdueAmount,
            openMaintenance,
            activeLeases,
            totalTenants
        );
    }

    private BigDecimal outstandingForInvoice(Invoice invoice) {
        BigDecimal paid = paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoice.getId()).stream()
            .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return invoice.getTotal().subtract(paid).max(BigDecimal.ZERO);
    }
}
