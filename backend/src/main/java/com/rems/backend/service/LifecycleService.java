package com.rems.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LifecycleService {

    private final BillingService billingService;
    private final LeaseService leaseService;

    public LifecycleService(BillingService billingService, LeaseService leaseService) {
        this.billingService = billingService;
        this.leaseService = leaseService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void runDailyBillingTasks() {
        billingService.markOverdueInvoices();
        leaseService.processAutoRenewals();
    }
}
