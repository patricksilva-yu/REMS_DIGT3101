package com.rems.backend.controller;

import com.rems.backend.domain.Invoice;
import com.rems.backend.domain.InvoiceLineItem;
import com.rems.backend.domain.Payment;
import com.rems.backend.domain.UtilityRate;
import com.rems.backend.domain.UtilityReading;
import com.rems.backend.dto.CreateUtilityReadingRequest;
import com.rems.backend.dto.RecordPaymentRequest;
import com.rems.backend.service.BillingService;
import com.rems.backend.service.PaymentService;
import com.rems.backend.service.UtilityService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BillingController {

    private final BillingService billingService;
    private final PaymentService paymentService;
    private final UtilityService utilityService;

    public BillingController(
        BillingService billingService,
        PaymentService paymentService,
        UtilityService utilityService
    ) {
        this.billingService = billingService;
        this.paymentService = paymentService;
        this.utilityService = utilityService;
    }

    @GetMapping("/invoices")
    public List<Invoice> listInvoices() {
        return billingService.listInvoices();
    }

    @GetMapping("/invoices/{invoiceId}/line-items")
    public List<InvoiceLineItem> listLineItems(@PathVariable UUID invoiceId) {
        return billingService.listLineItems(invoiceId);
    }

    @GetMapping("/payments")
    public List<Payment> listPayments() {
        return paymentService.listPayments();
    }

    @PostMapping("/payments")
    public Payment recordPayment(@Valid @RequestBody RecordPaymentRequest request) {
        return paymentService.recordPayment(request);
    }

    @GetMapping("/utilities/rates")
    public List<UtilityRate> listRates() {
        return utilityService.listRates();
    }

    @GetMapping("/utilities/readings")
    public List<UtilityReading> listReadings(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate readingMonth
    ) {
        return utilityService.listReadings(readingMonth);
    }

    @PostMapping("/utilities/readings")
    public UtilityReading createReading(@Valid @RequestBody CreateUtilityReadingRequest request) {
        return utilityService.createReading(request);
    }
}
