package com.rems.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateTenantRequest(
    @NotBlank String fullName,
    @Email @NotBlank String email,
    @NotBlank String phone,
    @NotBlank String businessType,
    @NotBlank String contactPerson,
    @NotBlank String companyName,
    @NotBlank String password
) {
}
