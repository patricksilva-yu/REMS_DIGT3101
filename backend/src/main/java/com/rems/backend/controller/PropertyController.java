package com.rems.backend.controller;

import com.rems.backend.domain.Property;
import com.rems.backend.domain.Unit;
import com.rems.backend.dto.CreatePropertyRequest;
import com.rems.backend.dto.CreateUnitRequest;
import com.rems.backend.service.PropertyService;
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
@RequestMapping("/api")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/properties")
    public List<Property> listProperties() {
        return propertyService.listProperties();
    }

    @PostMapping("/properties")
    public Property createProperty(@Valid @RequestBody CreatePropertyRequest request) {
        return propertyService.createProperty(request);
    }

    @GetMapping("/properties/{propertyId}/units")
    public List<Unit> listUnitsByProperty(@PathVariable UUID propertyId) {
        return propertyService.listUnitsByProperty(propertyId);
    }

    @GetMapping("/units")
    public List<Unit> listUnits() {
        return propertyService.listUnits();
    }

    @PostMapping("/units")
    public Unit createUnit(@Valid @RequestBody CreateUnitRequest request) {
        return propertyService.createUnit(request);
    }
}
