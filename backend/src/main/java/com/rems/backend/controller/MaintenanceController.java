package com.rems.backend.controller;

import com.rems.backend.domain.MaintenanceEvent;
import com.rems.backend.domain.MaintenanceRequest;
import com.rems.backend.dto.CreateMaintenanceRequest;
import com.rems.backend.dto.UpdateMaintenanceStatusRequest;
import com.rems.backend.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public List<MaintenanceRequest> listRequests() {
        return maintenanceService.listRequests();
    }

    @GetMapping("/{requestId}/events")
    public List<MaintenanceEvent> listEvents(@PathVariable UUID requestId) {
        return maintenanceService.listEvents(requestId);
    }

    @PostMapping
    public MaintenanceRequest createRequest(@Valid @RequestBody CreateMaintenanceRequest request) {
        return maintenanceService.createRequest(request);
    }

    @PatchMapping("/{requestId}/status")
    public MaintenanceRequest updateStatus(
        @PathVariable UUID requestId,
        @Valid @RequestBody UpdateMaintenanceStatusRequest request
    ) {
        return maintenanceService.updateStatus(requestId, request);
    }
}
