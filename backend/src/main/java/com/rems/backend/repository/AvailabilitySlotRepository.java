package com.rems.backend.repository;

import com.rems.backend.domain.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    List<AvailabilitySlot> findByPropertyIdOrderByStartsAtAsc(UUID propertyId);

    @Query("""
        select case when count(a) > 0 then true else false end
        from AvailabilitySlot a
        where a.agentId = :agentId
          and a.propertyId = :propertyId
          and a.startsAt <= :startsAt
          and a.endsAt >= :endsAt
        """)
    boolean hasCoveringSlot(
        @Param("agentId") UUID agentId,
        @Param("propertyId") UUID propertyId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt
    );
}
