package com.rems.backend.repository;

import com.rems.backend.domain.MaintenanceEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceEventRepository extends JpaRepository<MaintenanceEvent, UUID> {

    List<MaintenanceEvent> findByRequestIdOrderByCreatedAtAsc(UUID requestId);
}
