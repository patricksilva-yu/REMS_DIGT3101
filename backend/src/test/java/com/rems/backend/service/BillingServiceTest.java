package com.rems.backend.service;

import com.rems.backend.domain.DiscountPolicy;
import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.InvoiceLineItem;
import com.rems.backend.domain.Payment;
import com.rems.backend.domain.enums.InvoiceStatus;
import com.rems.backend.domain.enums.LeaseStatus;
import com.rems.backend.domain.enums.PaymentStatus;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceLineItemRepository invoiceLineItemRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UtilityReadingRepository utilityReadingRepository;

    @Mock
    private UtilityRateRepository utilityRateRepository;

    @Mock
    private PaymentCycleRateRepository paymentCycleRateRepository;

    @Mock
    private DiscountPolicyRepository discountPolicyRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private LeaseRepository leaseRepository;

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private BillingService billingService;

    @Test
    void resolveDiscountPercentReturnsBestEligiblePolicy() {
        UUID tenantId = UUID.randomUUID();
        DiscountPolicy twoStore = new DiscountPolicy();
        twoStore.setMinActiveLeases(2);
        twoStore.setDiscountPercent(BigDecimal.valueOf(5));

        DiscountPolicy portfolio = new DiscountPolicy();
        portfolio.setMinActiveLeases(3);
        portfolio.setDiscountPercent(BigDecimal.valueOf(8));

        when(leaseRepository.countByTenantIdAndStatus(tenantId, LeaseStatus.ACTIVE)).thenReturn(3L);
        when(discountPolicyRepository.findByEnabledTrueOrderByMinActiveLeasesDesc()).thenReturn(List.of(portfolio, twoStore));

        assertThat(billingService.resolveDiscountPercent(tenantId)).isEqualByComparingTo("8");
    }

    @Test
    void refreshInvoiceTotalsMarksInvoicePartiallyPaid() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setDueDate(LocalDate.now().plusDays(5));
        invoice.setTotal(BigDecimal.ZERO);

        InvoiceLineItem rent = new InvoiceLineItem();
        rent.setAmount(BigDecimal.valueOf(1000));
        InvoiceLineItem utilities = new InvoiceLineItem();
        utilities.setAmount(BigDecimal.valueOf(250.50));

        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setAmount(BigDecimal.valueOf(500));

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceLineItemRepository.findByInvoiceIdOrderByDescriptionAsc(invoiceId)).thenReturn(List.of(rent, utilities));
        when(paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoiceId)).thenReturn(List.of(payment));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Invoice refreshed = billingService.refreshInvoiceTotals(invoiceId);

        assertThat(refreshed.getSubtotal()).isEqualByComparingTo("1250.50");
        assertThat(refreshed.getTotal()).isEqualByComparingTo("1250.50");
        assertThat(refreshed.getStatus()).isEqualTo(InvoiceStatus.PARTIALLY_PAID);
    }
}
