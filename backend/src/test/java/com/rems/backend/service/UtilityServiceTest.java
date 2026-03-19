package com.rems.backend.service;

import com.rems.backend.domain.Unit;
import com.rems.backend.domain.UtilityReading;
import com.rems.backend.domain.enums.UtilityType;
import com.rems.backend.dto.CreateUtilityReadingRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.UnitRepository;
import com.rems.backend.repository.UtilityRateRepository;
import com.rems.backend.repository.UtilityReadingRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UtilityServiceTest {

    @Mock
    private UtilityRateRepository utilityRateRepository;

    @Mock
    private UtilityReadingRepository utilityReadingRepository;

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private UtilityService utilityService;

    @Test
    void createReadingRejectsMissingUnit() {
        UUID unitId = UUID.randomUUID();
        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> utilityService.createReading(
            new CreateUtilityReadingRequest(unitId, UtilityType.ELECTRICITY, LocalDate.of(2026, 3, 19), BigDecimal.TEN, "SIMULATED")
        )).isInstanceOf(NotFoundException.class)
            .hasMessageContaining("Unit not found");
    }

    @Test
    void createReadingNormalizesMonthToFirstDay() {
        UUID unitId = UUID.randomUUID();
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        when(utilityReadingRepository.save(any(UtilityReading.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UtilityReading reading = utilityService.createReading(
            new CreateUtilityReadingRequest(unitId, UtilityType.WATER, LocalDate.of(2026, 3, 19), BigDecimal.valueOf(22), "MANUAL")
        );

        assertThat(reading.getReadingMonth()).isEqualTo(LocalDate.of(2026, 3, 1));
        assertThat(reading.getQuantity()).isEqualByComparingTo("22");
    }
}
