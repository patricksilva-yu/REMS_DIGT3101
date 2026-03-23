package com.rems.backend.dto;

import com.rems.backend.domain.enums.PaymentCycle;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateRentalApplicationRequest(
    @NotNull UUID unitId,
    @NotBlank String applicantName,
    @Email @NotBlank String applicantEmail,
    @NotBlank String applicantPhone,
    @NotBlank String businessType,
    @NotBlank String contactPerson,
    @NotNull PaymentCycle requestedCycle,
    String notes
) {
}
