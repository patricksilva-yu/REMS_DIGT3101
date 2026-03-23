package com.rems.backend.repository;

import com.rems.backend.domain.RenewalPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RenewalPolicyRepository extends JpaRepository<RenewalPolicy, UUID> {
}
