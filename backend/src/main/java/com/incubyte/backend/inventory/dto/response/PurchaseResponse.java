package com.incubyte.backend.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseResponse(
        Long id,
        Long vehicleId,
        String vehicleMake,
        String vehicleModel,
        Integer quantity,
        BigDecimal purchasePrice,
        String buyerEmail,
        LocalDateTime purchasedAt
) {}
