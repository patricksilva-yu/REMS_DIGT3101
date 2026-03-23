package com.rems.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateUnitRequest(
    @NotNull UUID propertyId,
    @NotBlank String unitNumber,
    @NotNull Integer floorNumber,
    @Positive Integer sizeSqft,
    @NotNull BigDecimal baseRent,
    @NotBlank String classification,
    @NotBlank String businessPurpose
) {
}
