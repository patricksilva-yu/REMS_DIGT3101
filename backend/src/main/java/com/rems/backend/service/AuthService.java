package com.rems.backend.service;

import com.rems.backend.domain.UserAccount;
import com.rems.backend.dto.AuthLoginRequest;
import com.rems.backend.dto.AuthResponse;
import com.rems.backend.exception.UnauthorizedException;
import com.rems.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;

    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public AuthResponse login(AuthLoginRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus());
    }
}
