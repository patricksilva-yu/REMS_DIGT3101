package com.rems.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PublicUnitView(
    UUID id,
    UUID propertyId,
    String propertyName,
    String propertyAddress,
    String unitNumber,
    Integer floorNumber,
    Integer sizeSqft,
    BigDecimal baseRent,
    String classification,
    String businessPurpose,
    String status
) {
}
