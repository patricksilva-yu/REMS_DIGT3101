package com.rems.backend.repository;

import com.rems.backend.domain.Lease;
import com.rems.backend.domain.enums.LeaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaseRepository extends JpaRepository<Lease, UUID> {

    List<Lease> findAllByOrderByStartDateDesc();

    List<Lease> findByTenantIdOrderByStartDateDesc(UUID tenantId);

    Optional<Lease> findByUnitIdAndStatus(UUID unitId, LeaseStatus status);

    Optional<Lease> findByTenantIdAndUnitIdAndStatus(UUID tenantId, UUID unitId, LeaseStatus status);

    long countByTenantIdAndStatus(UUID tenantId, LeaseStatus status);

    List<Lease> findByStatusAndEndDateBetween(LeaseStatus status, LocalDate start, LocalDate end);
}
