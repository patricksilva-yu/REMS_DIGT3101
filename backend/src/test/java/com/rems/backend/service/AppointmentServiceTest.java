package com.rems.backend.service;

import com.rems.backend.domain.Appointment;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.enums.AppointmentStatus;
import com.rems.backend.dto.CreateAppointmentRequest;
import com.rems.backend.exception.ConflictException;
import com.rems.backend.repository.AppointmentRepository;
import com.rems.backend.repository.AvailabilitySlotRepository;
import com.rems.backend.repository.UnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AvailabilitySlotRepository availabilitySlotRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentService appointmentService;

    @Test
    void createAppointmentRejectsOverlappingUnitBooking() {
        UUID unitId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setPropertyId(UUID.randomUUID());
        unit.setUnitNumber("102");
        unit.setFloorNumber(1);
        unit.setSizeSqft(900);
        unit.setBaseRent(BigDecimal.valueOf(2100));
        unit.setClassification("Tier 2");
        unit.setBusinessPurpose("Professional services");

        OffsetDateTime startsAt = OffsetDateTime.now().plusDays(1);
        OffsetDateTime endsAt = startsAt.plusHours(1);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(availabilitySlotRepository.hasCoveringSlot(agentId, unit.getPropertyId(), startsAt, endsAt)).thenReturn(true);
        when(appointmentRepository.agentHasConflict(agentId, startsAt, endsAt, AppointmentStatus.CANCELLED)).thenReturn(false);
        when(appointmentRepository.unitHasConflict(unitId, startsAt, endsAt, AppointmentStatus.CANCELLED)).thenReturn(true);

        CreateAppointmentRequest request = new CreateAppointmentRequest(
            unitId,
            agentId,
            "Jamie Prospect",
            "jamie@example.com",
            "416-555-2001",
            startsAt,
            endsAt,
            "Morning walkthrough"
        );

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("overlapping appointment");
    }

    @Test
    void createAppointmentRejectsLongerThanTwoHours() {
        OffsetDateTime startsAt = OffsetDateTime.now().plusDays(1);
        CreateAppointmentRequest request = new CreateAppointmentRequest(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Jamie Prospect",
            "jamie@example.com",
            "416-555-2001",
            startsAt,
            startsAt.plusHours(3),
            "Too long"
        );

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("two hours or less");
    }

    @Test
    void createAppointmentRejectsOutsideAvailability() {
        UUID unitId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        Unit unit = buildUnit(unitId);
        OffsetDateTime startsAt = OffsetDateTime.now().plusDays(1);
        OffsetDateTime endsAt = startsAt.plusHours(2);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(availabilitySlotRepository.hasCoveringSlot(agentId, unit.getPropertyId(), startsAt, endsAt)).thenReturn(false);

        CreateAppointmentRequest request = new CreateAppointmentRequest(
            unitId,
            agentId,
            "Jamie Prospect",
            "jamie@example.com",
            "416-555-2001",
            startsAt,
            endsAt,
            "Needs evening slot"
        );

        assertThatThrownBy(() -> appointmentService.createAppointment(request))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("outside the leasing agent's available hours");
    }

    @Test
    void createAppointmentPersistsBookingWhenWindowIsValid() {
        UUID unitId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        Unit unit = buildUnit(unitId);
        OffsetDateTime startsAt = OffsetDateTime.now().plusDays(1);
        OffsetDateTime endsAt = startsAt.plusMinutes(90);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(availabilitySlotRepository.hasCoveringSlot(agentId, unit.getPropertyId(), startsAt, endsAt)).thenReturn(true);
        when(appointmentRepository.agentHasConflict(agentId, startsAt, endsAt, AppointmentStatus.CANCELLED)).thenReturn(false);
        when(appointmentRepository.unitHasConflict(unitId, startsAt, endsAt, AppointmentStatus.CANCELLED)).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateAppointmentRequest request = new CreateAppointmentRequest(
            unitId,
            agentId,
            "Jamie Prospect",
            "jamie@example.com",
            "416-555-2001",
            startsAt,
            endsAt,
            "Morning walkthrough"
        );

        Appointment saved = appointmentService.createAppointment(request);

        assertThat(saved.getUnitId()).isEqualTo(unitId);
        assertThat(saved.getAgentId()).isEqualTo(agentId);
        assertThat(saved.getStartsAt()).isEqualTo(startsAt);
        verify(notificationService).notify(agentId, com.rems.backend.domain.enums.NotificationType.APPOINTMENT, "New viewing booked", "A new viewing appointment was booked for unit 102.");
    }

    private static Unit buildUnit(UUID unitId) {
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setPropertyId(UUID.randomUUID());
        unit.setUnitNumber("102");
        unit.setFloorNumber(1);
        unit.setSizeSqft(900);
        unit.setBaseRent(BigDecimal.valueOf(2100));
        unit.setClassification("Tier 2");
        unit.setBusinessPurpose("Professional services");
        return unit;
    }
}
