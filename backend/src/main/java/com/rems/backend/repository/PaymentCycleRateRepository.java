package com.rems.backend.repository;

import com.rems.backend.domain.PaymentCycleRate;
import com.rems.backend.domain.enums.PaymentCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentCycleRateRepository extends JpaRepository<PaymentCycleRate, UUID> {

    Optional<PaymentCycleRate> findByCycle(PaymentCycle cycle);
}
