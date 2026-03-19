package com.rems.backend.repository;

import com.rems.backend.domain.Appointment;
import com.rems.backend.domain.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findAllByOrderByStartsAtDesc();

    @Query("""
        select case when count(a) > 0 then true else false end
        from Appointment a
        where a.agentId = :agentId
          and a.status <> :cancelled
          and a.startsAt < :endsAt
          and a.endsAt > :startsAt
        """)
    boolean agentHasConflict(
        @Param("agentId") UUID agentId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt,
        @Param("cancelled") AppointmentStatus cancelled
    );

    @Query("""
        select case when count(a) > 0 then true else false end
        from Appointment a
        where a.unitId = :unitId
          and a.status <> :cancelled
          and a.startsAt < :endsAt
          and a.endsAt > :startsAt
        """)
    boolean unitHasConflict(
        @Param("unitId") UUID unitId,
        @Param("startsAt") OffsetDateTime startsAt,
        @Param("endsAt") OffsetDateTime endsAt,
        @Param("cancelled") AppointmentStatus cancelled
    );
}
