package com.rems.backend.service;

import com.rems.backend.domain.Property;
import com.rems.backend.domain.Unit;
import com.rems.backend.dto.CreatePropertyRequest;
import com.rems.backend.dto.CreateUnitRequest;
import com.rems.backend.exception.NotFoundException;
import com.rems.backend.repository.PropertyRepository;
import com.rems.backend.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UnitRepository unitRepository;

    public PropertyService(PropertyRepository propertyRepository, UnitRepository unitRepository) {
        this.propertyRepository = propertyRepository;
        this.unitRepository = unitRepository;
    }

    public List<Property> listProperties() {
        return propertyRepository.findAll();
    }

    public List<Unit> listUnits() {
        return unitRepository.findAll();
    }

    public List<Unit> listUnitsByProperty(UUID propertyId) {
        return unitRepository.findByPropertyIdOrderByUnitNumberAsc(propertyId);
    }

    @Transactional
    public Property createProperty(CreatePropertyRequest request) {
        Property property = new Property();
        property.setName(request.name());
        property.setAddress(request.address());
        property.setDescription(request.description());
        return propertyRepository.save(property);
    }

    @Transactional
    public Unit createUnit(CreateUnitRequest request) {
        propertyRepository.findById(request.propertyId())
            .orElseThrow(() -> new NotFoundException("Property not found."));

        Unit unit = new Unit();
        unit.setPropertyId(request.propertyId());
        unit.setUnitNumber(request.unitNumber());
        unit.setFloorNumber(request.floorNumber());
        unit.setSizeSqft(request.sizeSqft());
        unit.setBaseRent(request.baseRent());
        unit.setClassification(request.classification());
        unit.setBusinessPurpose(request.businessPurpose());
        return unitRepository.save(unit);
    }
}
