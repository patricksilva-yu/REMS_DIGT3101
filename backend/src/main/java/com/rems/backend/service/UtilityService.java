package com.rems.backend.service;

import com.rems.backend.domain.UtilityRate;
import com.rems.backend.domain.UtilityReading;
import com.rems.backend.dto.CreateUtilityReadingRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UtilityRateRepository;
import com.rems.backend.repository.UtilityReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class UtilityService {

    private final UtilityRateRepository utilityRateRepository;
    private final UtilityReadingRepository utilityReadingRepository;
    private final UnitRepository unitRepository;

    public UtilityService(
        UtilityRateRepository utilityRateRepository,
        UtilityReadingRepository utilityReadingRepository,
        UnitRepository unitRepository
    ) {
        this.utilityRateRepository = utilityRateRepository;
        this.utilityReadingRepository = utilityReadingRepository;
        this.unitRepository = unitRepository;
    }

    public List<UtilityRate> listRates() {
        return utilityRateRepository.findAllByOrderByUtilityTypeAscEffectiveFromDesc();
    }

    public List<UtilityReading> listReadings(LocalDate readingMonth) {
        if (readingMonth == null) {
            return utilityReadingRepository.findAll();
        }
        return utilityReadingRepository.findByReadingMonthOrderByCreatedAtDesc(readingMonth);
    }

    @Transactional
    public UtilityReading createReading(CreateUtilityReadingRequest request) {
        unitRepository.findById(request.unitId()).orElseThrow(() -> new NotFoundException("Unit not found."));

        UtilityReading reading = new UtilityReading();
        reading.setUnitId(request.unitId());
        reading.setUtilityType(request.utilityType());
        reading.setReadingMonth(request.readingMonth().withDayOfMonth(1));
        reading.setQuantity(request.quantity());
        reading.setSource(request.source());
        return utilityReadingRepository.save(reading);
    }
}
