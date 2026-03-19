package com.rems.backend.repository;

import com.rems.backend.domain.UtilityRate;
import com.rems.backend.domain.enums.UtilityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UtilityRateRepository extends JpaRepository<UtilityRate, UUID> {

    Optional<UtilityRate> findTopByUtilityTypeAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
        UtilityType utilityType,
        LocalDate effectiveFrom
    );

    List<UtilityRate> findAllByOrderByUtilityTypeAscEffectiveFromDesc();
}
