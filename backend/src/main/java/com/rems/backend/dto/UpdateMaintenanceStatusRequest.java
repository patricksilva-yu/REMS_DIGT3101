package com.rems.backend.dto;

import com.rems.backend.domain.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateMaintenanceStatusRequest(
    @NotNull MaintenanceStatus status,
    String notes
) {
}
