package com.incubyte.backend.vehicle.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record VehicleRequest(
    @NotBlank(message = "Make is required")
    String make,

    @NotBlank(message = "Model is required")
    String model,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    BigDecimal price,

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    Integer quantity,

    Integer year,
    String color,
    String fuelType,
    String transmission,
    String engineCapacity,
    Integer seatingCapacity,
    String description
) {}
