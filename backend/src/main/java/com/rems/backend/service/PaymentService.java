package com.rems.backend.service;

import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.Payment;
import com.rems.backend.dto.RecordPaymentRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.InvoiceRepository;
import com.rems.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingService billingService;

    public PaymentService(
        PaymentRepository paymentRepository,
        InvoiceRepository invoiceRepository,
        BillingService billingService
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.billingService = billingService;
    }

    public List<Payment> listPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc();
    }

    @Transactional
    public Payment recordPayment(RecordPaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.invoiceId())
            .orElseThrow(() -> new NotFoundException("Invoice not found."));

        Payment payment = new Payment();
        payment.setInvoiceId(invoice.getId());
        payment.setAmount(request.amount());
        payment.setPaidAt(request.paidAt());
        payment.setReference(request.reference());
        Payment saved = paymentRepository.save(payment);
        billingService.refreshInvoiceTotals(invoice.getId());
        return saved;
    }
}
