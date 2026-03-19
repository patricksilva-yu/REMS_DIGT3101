package com.rems.backend.service;

import com.rems.backend.domain.Property;
import com.rems.backend.domain.Unit;
import com.rems.backend.domain.enums.UnitStatus;
import com.rems.backend.dto.PublicUnitView;
import com.rems.backend.repository.PropertyRepository;
import com.rems.backend.repository.UnitRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class CatalogService {

    private final UnitRepository unitRepository;
    private final PropertyRepository propertyRepository;

    public CatalogService(UnitRepository unitRepository, PropertyRepository propertyRepository) {
        this.unitRepository = unitRepository;
        this.propertyRepository = propertyRepository;
    }

    public List<PublicUnitView> searchUnits(String q, String classification, BigDecimal maxRent, Integer minSize) {
        List<Unit> units = unitRepository.findByStatusInOrderByUnitNumberAsc(List.of(UnitStatus.AVAILABLE, UnitStatus.RESERVED));
        Map<UUID, Property> properties = propertyRepository.findAll().stream()
            .collect(Collectors.toMap(Property::getId, property -> property));

        Predicate<Unit> predicate = unit -> true;

        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            predicate = predicate.and(unit -> {
                Property property = properties.get(unit.getPropertyId());
                return unit.getUnitNumber().toLowerCase().contains(query)
                    || unit.getBusinessPurpose().toLowerCase().contains(query)
                    || (property != null && property.getName().toLowerCase().contains(query));
            });
        }

        if (classification != null && !classification.isBlank()) {
            predicate = predicate.and(unit -> unit.getClassification().equalsIgnoreCase(classification));
        }

        if (maxRent != null) {
            predicate = predicate.and(unit -> unit.getBaseRent().compareTo(maxRent) <= 0);
        }

        if (minSize != null) {
            predicate = predicate.and(unit -> unit.getSizeSqft() >= minSize);
        }

        return units.stream()
            .filter(predicate)
            .map(unit -> {
                Property property = properties.get(unit.getPropertyId());
                return new PublicUnitView(
                    unit.getId(),
                    unit.getPropertyId(),
                    property != null ? property.getName() : "Unknown Property",
                    property != null ? property.getAddress() : "",
                    unit.getUnitNumber(),
                    unit.getFloorNumber(),
                    unit.getSizeSqft(),
                    unit.getBaseRent(),
                    unit.getClassification(),
                    unit.getBusinessPurpose(),
                    unit.getStatus().name()
                );
            })
            .toList();
    }
}
