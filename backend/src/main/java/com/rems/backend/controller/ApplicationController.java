package com.rems.backend.controller;

import com.rems.backend.domain.RentalApplication;
import com.rems.backend.dto.ReviewApplicationRequest;
import com.rems.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<RentalApplication> listApplications() {
        return applicationService.listApplications();
    }

    @PostMapping("/{applicationId}/review")
    public Object reviewApplication(@PathVariable UUID applicationId, @Valid @RequestBody ReviewApplicationRequest request) {
        return applicationService.reviewApplication(applicationId, request);
    }
}
