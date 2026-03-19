package com.rems.backend.service;

import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.Payment;
import com.rems.backend.dto.RecordPaymentRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.InvoiceRepository;
import com.rems.backend.repository.PaymentRepository;
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
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private BillingService billingService;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void recordPaymentRejectsMissingInvoice() {
        UUID invoiceId = UUID.randomUUID();
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.recordPayment(
            new RecordPaymentRequest(invoiceId, BigDecimal.valueOf(500), LocalDate.now(), "EFT-404")
        )).isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Invoice not found");
    }

    @Test
    void recordPaymentPersistsAndRefreshesInvoiceTotals() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment payment = paymentService.recordPayment(
            new RecordPaymentRequest(invoiceId, BigDecimal.valueOf(825.50), LocalDate.of(2026, 3, 19), "EFT-10009")
        );

        assertThat(payment.getInvoiceId()).isEqualTo(invoiceId);
        assertThat(payment.getAmount()).isEqualByComparingTo("825.50");
        assertThat(payment.getReference()).isEqualTo("EFT-10009");
        verify(billingService).refreshInvoiceTotals(invoiceId);
    }
}
