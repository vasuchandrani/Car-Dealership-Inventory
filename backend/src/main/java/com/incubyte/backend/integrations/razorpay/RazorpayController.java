package com.incubyte.backend.integrations.razorpay;

import com.incubyte.backend.common.ApiResponse;
import com.incubyte.backend.integrations.razorpay.dto.request.OrderRequest;
import com.incubyte.backend.integrations.razorpay.dto.request.VerifyPaymentRequest;
import com.incubyte.backend.integrations.razorpay.dto.response.OrderResponse;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class RazorpayController {

    private final RazorpayService razorpayService;

    public RazorpayController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        try {
            OrderResponse orderResponse = razorpayService.createOrder(request);
            ApiResponse<OrderResponse> response = ApiResponse.success("Razorpay order created successfully", orderResponse);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RazorpayException e) {
            ApiResponse<OrderResponse> response = ApiResponse.error("Failed to create Razorpay order: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        boolean isValid = razorpayService.verifyPaymentSignature(request);
        if (isValid) {
            ApiResponse<Boolean> response = ApiResponse.success("Payment verified successfully", true);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            ApiResponse<Boolean> response = new ApiResponse<>(false, "Payment signature verification failed", false, null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}
