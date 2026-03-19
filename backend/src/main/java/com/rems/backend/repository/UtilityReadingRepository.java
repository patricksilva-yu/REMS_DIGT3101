package com.rems.backend.repository;

import com.rems.backend.domain.UtilityReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface UtilityReadingRepository extends JpaRepository<UtilityReading, UUID> {

    List<UtilityReading> findByReadingMonthOrderByCreatedAtDesc(LocalDate readingMonth);

    List<UtilityReading> findByUnitIdAndReadingMonth(UUID unitId, LocalDate readingMonth);
}
