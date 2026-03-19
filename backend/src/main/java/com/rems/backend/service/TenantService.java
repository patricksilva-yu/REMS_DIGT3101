package com.rems.backend.service;

import com.rems.backend.domain.UserAccount;
import com.rems.backend.domain.enums.UserRole;
import com.rems.backend.dto.CreateTenantRequest;
import com.rems.backend.exception.ConflictException;
import com.rems.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantService {

    private final UserAccountRepository userAccountRepository;

    public TenantService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public List<UserAccount> listTenants() {
        return userAccountRepository.findByRoleOrderByFullNameAsc(UserRole.TENANT);
    }

    @Transactional
    public UserAccount createTenant(CreateTenantRequest request) {
        userAccountRepository.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            throw new ConflictException("A tenant with that email already exists.");
        });

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(UserRole.TENANT);
        user.setPhone(request.phone());
        user.setBusinessType(request.businessType());
        user.setContactPerson(request.contactPerson());
        user.setCompanyName(request.companyName());
        return userAccountRepository.save(user);
    }
}
