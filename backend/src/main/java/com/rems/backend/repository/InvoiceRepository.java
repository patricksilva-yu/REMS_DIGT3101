package com.rems.backend.repository;

import com.rems.backend.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findAllByOrderByDueDateDesc();

    List<Invoice> findByLeaseIdOrderByDueDateDesc(UUID leaseId);

    Optional<Invoice> findByLeaseIdAndBillingPeriodStartAndBillingPeriodEnd(UUID leaseId, LocalDate start, LocalDate end);
}
