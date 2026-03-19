package com.rems.backend.repository;

import com.rems.backend.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findAllByOrderByPaidAtDesc();

    List<Payment> findByInvoiceIdOrderByPaidAtDesc(UUID invoiceId);
}
