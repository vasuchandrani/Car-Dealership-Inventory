package com.incubyte.backend.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PurchaseRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotBlank(message = "Razorpay order ID is required")
        String razorpayOrderId,

        @NotBlank(message = "Razorpay payment ID is required")
        String razorpayPaymentId,

        @NotBlank(message = "Razorpay signature is required")
        String razorpaySignature
) {}
