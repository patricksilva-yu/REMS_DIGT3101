package com.rems.backend.repository;

import com.rems.backend.domain.DiscountPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiscountPolicyRepository extends JpaRepository<DiscountPolicy, UUID> {

    List<DiscountPolicy> findByEnabledTrueOrderByMinActiveLeasesDesc();
}
