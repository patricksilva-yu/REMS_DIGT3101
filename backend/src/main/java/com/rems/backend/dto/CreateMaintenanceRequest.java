package com.rems.backend.dto;

import com.rems.backend.domain.enums.MaintenanceCategory;
import com.rems.backend.domain.enums.MaintenanceUrgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateMaintenanceRequest(
    @NotNull UUID tenantId,
    @NotNull UUID unitId,
    UUID leaseId,
    @NotNull MaintenanceCategory category,
    @NotBlank String description,
    @NotNull MaintenanceUrgency urgency,
    boolean misuseCaused,
    BigDecimal misuseChargeAmount
) {
}
