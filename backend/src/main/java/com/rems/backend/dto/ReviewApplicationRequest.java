package com.rems.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReviewApplicationRequest(
    @NotNull UUID reviewerId,
    boolean approved,
    String notes,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal depositAmount,
    Boolean autoRenew,
    UUID renewalPolicyId
) {
}
