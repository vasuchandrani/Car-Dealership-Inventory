package com.incubyte.backend.integrations.razorpay.dto.response;

public record OrderResponse(
        String orderId,
        String currency,
        int amount,
        String status,
        String keyId
) {}
