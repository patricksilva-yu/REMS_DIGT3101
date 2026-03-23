package com.rems.backend.dto;

import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.domain.enums.UserStatus;

import java.util.UUID;

public record AuthResponse(
    UUID id,
    String fullName,
    String email,
    UserRole role,
    UserStatus status
) {
}
