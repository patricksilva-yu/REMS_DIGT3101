package com.rems.backend.service;

import com.rems.backend.domain.UserAccount;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.AuthLoginRequest;
import com.rems.backend.exception.UnauthorizedException;
import com.rems.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsAuthenticatedUser() {
        UserAccount user = new UserAccount();
        user.setEmail("admin@rems.com");
        user.setPassword("demo123");
        user.setFullName("Admin");
        user.setRole(UserRole.ADMIN);

        when(userAccountRepository.findByEmailIgnoreCase("admin@rems.com")).thenReturn(Optional.of(user));

        var response = authService.login(new AuthLoginRequest("admin@rems.com", "demo123"));

        assertThat(response.email()).isEqualTo("admin@rems.com");
        assertThat(response.role()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    void loginRejectsWrongPassword() {
        UserAccount user = new UserAccount();
        user.setEmail("admin@rems.com");
        user.setPassword("demo123");

        when(userAccountRepository.findByEmailIgnoreCase("admin@rems.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new AuthLoginRequest("admin@rems.com", "wrong")))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("Invalid email or password");
    }
}
