package com.rems.backend.service;

import com.rems.backend.domain.Appointment;
import com.rems.backend.domain.AvailabilitySlot;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.enums.AppointmentStatus;
import com.rems.backend.dto.CreateAppointmentRequest;
import com.rems.backend.exception.ConflictException;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.AppointmentRepository;
import com.rems.backend.repository.AvailabilitySlotRepository;
import com.rems.backend.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final UnitRepository unitRepository;
    private final NotificationService notificationService;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        AvailabilitySlotRepository availabilitySlotRepository,
        UnitRepository unitRepository,
        NotificationService notificationService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.unitRepository = unitRepository;
        this.notificationService = notificationService;
    }

    public List<Appointment> listAppointments() {
        return appointmentRepository.findAllByOrderByStartsAtDesc();
    }

    public List<AvailabilitySlot> listAvailabilitySlots(java.util.UUID propertyId) {
        if (propertyId == null) {
            return availabilitySlotRepository.findAll();
        }
        return availabilitySlotRepository.findByPropertyIdOrderByStartsAtAsc(propertyId);
    }

    @Transactional
    public Appointment createAppointment(CreateAppointmentRequest request) {
        if (!request.endsAt().isAfter(request.startsAt())) {
            throw new ConflictException("Appointment end time must be after start time.");
        }

        if (Duration.between(request.startsAt(), request.endsAt()).toHours() > 2) {
            throw new ConflictException("Appointments must be two hours or less.");
        }

        Unit unit = unitRepository.findById(request.unitId())
            .orElseThrow(() -> new NotFoundException("Unit not found."));

        boolean coveredByAvailability = availabilitySlotRepository.hasCoveringSlot(
            request.agentId(),
            unit.getPropertyId(),
            request.startsAt(),
            request.endsAt()
        );

        if (!coveredByAvailability) {
            throw new ConflictException("The requested time is outside the leasing agent's available hours.");
        }

        if (appointmentRepository.agentHasConflict(
            request.agentId(),
            request.startsAt(),
            request.endsAt(),
            AppointmentStatus.CANCELLED
        )) {
            throw new ConflictException("The selected leasing agent is already booked.");
        }

        if (appointmentRepository.unitHasConflict(
            request.unitId(),
            request.startsAt(),
            request.endsAt(),
            AppointmentStatus.CANCELLED
        )) {
            throw new ConflictException("The selected unit already has an overlapping appointment.");
        }

        Appointment appointment = new Appointment();
        appointment.setUnitId(request.unitId());
        appointment.setAgentId(request.agentId());
        appointment.setApplicantName(request.applicantName());
        appointment.setApplicantEmail(request.applicantEmail());
        appointment.setApplicantPhone(request.applicantPhone());
        appointment.setStartsAt(request.startsAt());
        appointment.setEndsAt(request.endsAt());
        appointment.setNotes(request.notes());

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notify(
            request.agentId(),
            com.rems.backend.domain.enums.NotificationType.APPOINTMENT,
            "New viewing booked",
            "A new viewing appointment was booked for unit " + unit.getUnitNumber() + "."
        );
        return saved;
    }
}
