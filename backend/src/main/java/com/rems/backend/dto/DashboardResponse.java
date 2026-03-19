package com.rems.backend.dto;

import java.math.BigDecimal;

public record DashboardResponse(
    long totalProperties,
    long totalUnits,
    long occupiedUnits,
    long occupancyRate,
    long availableUnits,
    BigDecimal totalMonthlyRent,
    BigDecimal overdueAmount,
    long openMaintenance,
    long activeLeases,
    long totalTenants
) {
}
