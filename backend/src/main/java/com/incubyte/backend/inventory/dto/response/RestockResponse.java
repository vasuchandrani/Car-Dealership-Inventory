package com.incubyte.backend.inventory.dto.response;

public record RestockResponse(
        Long vehicleId,
        String make,
        String model,
        Integer updatedQuantity
) {}
