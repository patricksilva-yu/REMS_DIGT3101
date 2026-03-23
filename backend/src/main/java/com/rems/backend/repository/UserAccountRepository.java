package com.rems.backend.repository;

import com.rems.backend.domain.UserAccount;
import com.rems.backend.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    List<UserAccount> findByRoleOrderByFullNameAsc(UserRole role);
}
