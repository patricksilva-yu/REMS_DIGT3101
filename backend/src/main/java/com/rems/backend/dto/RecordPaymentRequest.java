package com.rems.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecordPaymentRequest(
    @NotNull UUID invoiceId,
    @Positive BigDecimal amount,
    @NotNull LocalDate paidAt,
    @NotBlank String reference
) {
}
