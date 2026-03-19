package com.rems.backend.service;

import com.rems.backend.domain.DiscountPolicy;
import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.InvoiceLineItem;
import com.rems.backend.domain.Lease;
import com.rems.backend.domain.MaintenanceRequest;
import com.rems.backend.domain.Payment;
import com.rems.backend.domain.PaymentCycleRate;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.UtilityRate;
import com.rems.backend.domain.UtilityReading;
import com.rems.backend.domain.enums.InvoiceStatus;
import com.rems.backend.domain.enums.LeaseStatus;
import com.rems.backend.domain.enums.PaymentCycle;
import com.rems.backend.domain.enums.PaymentStatus;
import com.rems.backend.domain.enums.UtilityType;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.DiscountPolicyRepository;
import com.rems.backend.repository.InvoiceLineItemRepository;
import com.rems.backend.repository.InvoiceRepository;
import com.rems.backend.repository.LeaseRepository;
import com.rems.backend.repository.MaintenanceRequestRepository;
import com.rems.backend.repository.PaymentCycleRateRepository;
import com.rems.backend.repository.PaymentRepository;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UtilityRateRepository;
import com.rems.backend.repository.UtilityReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;
    private final PaymentRepository paymentRepository;
    private final UtilityReadingRepository utilityReadingRepository;
    private final UtilityRateRepository utilityRateRepository;
    private final PaymentCycleRateRepository paymentCycleRateRepository;
    private final DiscountPolicyRepository discountPolicyRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final LeaseRepository leaseRepository;
    private final UnitRepository unitRepository;

    public BillingService(
        InvoiceRepository invoiceRepository,
        InvoiceLineItemRepository invoiceLineItemRepository,
        PaymentRepository paymentRepository,
        UtilityReadingRepository utilityReadingRepository,
        UtilityRateRepository utilityRateRepository,
        PaymentCycleRateRepository paymentCycleRateRepository,
        DiscountPolicyRepository discountPolicyRepository,
        MaintenanceRequestRepository maintenanceRequestRepository,
        LeaseRepository leaseRepository,
        UnitRepository unitRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceLineItemRepository = invoiceLineItemRepository;
        this.paymentRepository = paymentRepository;
        this.utilityReadingRepository = utilityReadingRepository;
        this.utilityRateRepository = utilityRateRepository;
        this.paymentCycleRateRepository = paymentCycleRateRepository;
        this.discountPolicyRepository = discountPolicyRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.leaseRepository = leaseRepository;
        this.unitRepository = unitRepository;
    }

    public List<Invoice> listInvoices() {
        return invoiceRepository.findAllByOrderByDueDateDesc();
    }

    public List<InvoiceLineItem> listLineItems(UUID invoiceId) {
        return invoiceLineItemRepository.findByInvoiceIdOrderByDescriptionAsc(invoiceId);
    }

    public BigDecimal resolveDiscountPercent(UUID tenantId) {
        long activeLeases = leaseRepository.countByTenantIdAndStatus(tenantId, LeaseStatus.ACTIVE);
        return discountPolicyRepository.findByEnabledTrueOrderByMinActiveLeasesDesc().stream()
            .filter(policy -> activeLeases >= policy.getMinActiveLeases())
            .map(DiscountPolicy::getDiscountPercent)
            .findFirst()
            .orElse(BigDecimal.ZERO);
    }

    public PaymentCycleRate getCycleRate(PaymentCycle paymentCycle) {
        return paymentCycleRateRepository.findByCycle(paymentCycle)
            .orElseThrow(() -> new NotFoundException("Payment cycle rate not configured."));
    }

    @Transactional
    public Invoice generateInvoiceForLease(Lease lease, LocalDate billingPeriodStart) {
        int cycleMonths = cycleMonths(lease.getPaymentCycle());
        LocalDate start = billingPeriodStart.withDayOfMonth(1);
        LocalDate end = start.plusMonths(cycleMonths).minusDays(1);

        return invoiceRepository.findByLeaseIdAndBillingPeriodStartAndBillingPeriodEnd(lease.getId(), start, end)
            .orElseGet(() -> createInvoice(lease, start, end, cycleMonths));
    }

    @Transactional
    public void attachMaintenanceCharge(MaintenanceRequest request) {
        if (!request.isMisuseCaused() || request.getLeaseId() == null || request.getMisuseChargeAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        Lease lease = leaseRepository.findById(request.getLeaseId())
            .orElseThrow(() -> new NotFoundException("Lease not found for maintenance charge."));

        Invoice invoice = generateInvoiceForLease(lease, LocalDate.now().withDayOfMonth(1));
        String description = "Maintenance misuse charge - request " + request.getId();

        boolean alreadyPresent = invoiceLineItemRepository.findByInvoiceIdOrderByDescriptionAsc(invoice.getId()).stream()
            .anyMatch(item -> item.getDescription().equals(description));

        if (alreadyPresent) {
            return;
        }

        InvoiceLineItem lineItem = new InvoiceLineItem();
        lineItem.setInvoiceId(invoice.getId());
        lineItem.setLineType("MAINTENANCE");
        lineItem.setDescription(description);
        lineItem.setAmount(request.getMisuseChargeAmount());
        invoiceLineItemRepository.save(lineItem);
        refreshInvoiceTotals(invoice.getId());
    }

    @Transactional
    public Invoice refreshInvoiceTotals(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new NotFoundException("Invoice not found."));

        List<InvoiceLineItem> lineItems = invoiceLineItemRepository.findByInvoiceIdOrderByDescriptionAsc(invoiceId);
        BigDecimal subtotal = lineItems.stream()
            .map(InvoiceLineItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paid = paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoiceId).stream()
            .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal);

        if (paid.compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else if (invoice.getDueDate().isBefore(LocalDate.now())) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
        } else {
            invoice.setStatus(InvoiceStatus.ISSUED);
        }

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void markOverdueInvoices() {
        invoiceRepository.findAll().stream()
            .filter(invoice -> invoice.getStatus() != InvoiceStatus.PAID && invoice.getDueDate().isBefore(LocalDate.now()))
            .forEach(invoice -> {
                invoice.setStatus(InvoiceStatus.OVERDUE);
                invoiceRepository.save(invoice);
            });
    }

    private Invoice createInvoice(Lease lease, LocalDate start, LocalDate end, int cycleMonths) {
        Unit unit = unitRepository.findById(lease.getUnitId())
            .orElseThrow(() -> new NotFoundException("Unit not found."));

        Invoice invoice = new Invoice();
        invoice.setLeaseId(lease.getId());
        invoice.setBillingPeriodStart(start);
        invoice.setBillingPeriodEnd(end);
        invoice.setDueDate(start.plusDays(10));
        invoice.setStatus(invoice.getDueDate().isBefore(LocalDate.now()) ? InvoiceStatus.OVERDUE : InvoiceStatus.ISSUED);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        List<InvoiceLineItem> lineItems = new ArrayList<>();
        BigDecimal rentAmount = lease.getEffectiveRent().multiply(BigDecimal.valueOf(cycleMonths)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal undiscountedRent = unit.getBaseRent().multiply(BigDecimal.valueOf(cycleMonths)).setScale(2, RoundingMode.HALF_UP);

        InvoiceLineItem rentLineItem = new InvoiceLineItem();
        rentLineItem.setInvoiceId(savedInvoice.getId());
        rentLineItem.setLineType("RENT");
        rentLineItem.setDescription(lease.getPaymentCycle().name() + " rent for Unit " + unit.getUnitNumber());
        rentLineItem.setAmount(rentAmount);
        lineItems.add(rentLineItem);

        for (LocalDate cursor = start; !cursor.isAfter(end); cursor = cursor.plusMonths(1)) {
            LocalDate readingMonth = cursor.withDayOfMonth(1);
            List<UtilityReading> readings = utilityReadingRepository.findByUnitIdAndReadingMonth(lease.getUnitId(), readingMonth);
            for (UtilityReading reading : readings) {
                UtilityRate rate = utilityRateRepository
                    .findTopByUtilityTypeAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(reading.getUtilityType(), readingMonth)
                    .orElseThrow(() -> new NotFoundException("Missing utility rate for " + reading.getUtilityType()));

                InvoiceLineItem utilityLineItem = new InvoiceLineItem();
                utilityLineItem.setInvoiceId(savedInvoice.getId());
                utilityLineItem.setLineType("UTILITY");
                utilityLineItem.setDescription(reading.getUtilityType().name() + " usage for " + readingMonth);
                utilityLineItem.setAmount(reading.getQuantity().multiply(rate.getRatePerUnit()).setScale(2, RoundingMode.HALF_UP));
                lineItems.add(utilityLineItem);
            }
        }

        List<MaintenanceRequest> maintenanceRequests = maintenanceRequestRepository.findAll().stream()
            .filter(request -> lease.getId().equals(request.getLeaseId()))
            .filter(MaintenanceRequest::isMisuseCaused)
            .toList();

        for (MaintenanceRequest request : maintenanceRequests) {
            InvoiceLineItem maintenanceLineItem = new InvoiceLineItem();
            maintenanceLineItem.setInvoiceId(savedInvoice.getId());
            maintenanceLineItem.setLineType("MAINTENANCE");
            maintenanceLineItem.setDescription("Maintenance misuse charge - request " + request.getId());
            maintenanceLineItem.setAmount(request.getMisuseChargeAmount());
            lineItems.add(maintenanceLineItem);
        }

        invoiceLineItemRepository.saveAll(lineItems);
        BigDecimal subtotal = lineItems.stream().map(InvoiceLineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        savedInvoice.setDiscountAmount(undiscountedRent.subtract(rentAmount).max(BigDecimal.ZERO));
        savedInvoice.setSubtotal(subtotal);
        savedInvoice.setTotal(subtotal);
        return invoiceRepository.save(savedInvoice);
    }

    private int cycleMonths(PaymentCycle paymentCycle) {
        return switch (paymentCycle) {
            case MONTHLY -> 1;
            case QUARTERLY -> 3;
            case BIANNUAL -> 6;
            case ANNUAL -> 12;
        };
    }
}
