package com.incubyte.backend.vehicle.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VehicleResponse(
    Long id,
    String make,
    String model,
    String category,
    BigDecimal price,
    Integer quantity,
    Integer year,
    String color,
    String fuelType,
    String transmission,
    String engineCapacity,
    Integer seatingCapacity,
    String description,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
