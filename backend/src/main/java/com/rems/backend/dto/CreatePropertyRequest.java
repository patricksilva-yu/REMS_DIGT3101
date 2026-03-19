package com.rems.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePropertyRequest(
    @NotBlank String name,
    @NotBlank String address,
    @NotBlank String description
) {
}
