package com.rems.backend.controller;

import com.rems.backend.domain.Appointment;
import com.rems.backend.domain.AvailabilitySlot;
import com.rems.backend.domain.RentalApplication;
import com.rems.backend.dto.CreateAppointmentRequest;
import com.rems.backend.dto.CreateRentalApplicationRequest;
import com.rems.backend.dto.PublicUnitView;
import com.rems.backend.service.ApplicationService;
import com.rems.backend.service.AppointmentService;
import com.rems.backend.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final CatalogService catalogService;
    private final AppointmentService appointmentService;
    private final ApplicationService applicationService;

    public PublicController(
        CatalogService catalogService,
        AppointmentService appointmentService,
        ApplicationService applicationService
    ) {
        this.catalogService = catalogService;
        this.appointmentService = appointmentService;
        this.applicationService = applicationService;
    }

    @GetMapping("/units/search")
    public List<PublicUnitView> searchUnits(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String classification,
        @RequestParam(required = false) BigDecimal maxRent,
        @RequestParam(required = false) Integer minSize
    ) {
        return catalogService.searchUnits(q, classification, maxRent, minSize);
    }

    @GetMapping("/availability")
    public List<AvailabilitySlot> listAvailability(@RequestParam(required = false) UUID propertyId) {
        return appointmentService.listAvailabilitySlots(propertyId);
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    @PostMapping("/applications")
    public RentalApplication createApplication(@Valid @RequestBody CreateRentalApplicationRequest request) {
        return applicationService.createApplication(request);
    }
}
