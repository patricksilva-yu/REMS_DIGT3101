package com.rems.backend.repository;

import com.rems.backend.domain.Unit;
import com.rems.backend.domain.enums.UnitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UnitRepository extends JpaRepository<Unit, UUID> {

    List<Unit> findByPropertyIdOrderByUnitNumberAsc(UUID propertyId);

    List<Unit> findByStatusInOrderByUnitNumberAsc(Collection<UnitStatus> statuses);
}
