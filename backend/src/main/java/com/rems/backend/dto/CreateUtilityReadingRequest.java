package com.rems.backend.dto;

import com.rems.backend.domain.enums.UtilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateUtilityReadingRequest(
    @NotNull UUID unitId,
    @NotNull UtilityType utilityType,
    @NotNull LocalDate readingMonth,
    @Positive BigDecimal quantity,
    @NotBlank String source
) {
}
