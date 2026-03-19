package com.rems.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateAppointmentRequest(
    @NotNull UUID unitId,
    @NotNull UUID agentId,
    @NotBlank String applicantName,
    @Email @NotBlank String applicantEmail,
    @NotBlank String applicantPhone,
    @NotNull @Future OffsetDateTime startsAt,
    @NotNull @Future OffsetDateTime endsAt,
    String notes
) {
}
