package com.incubyte.backend.integrations.razorpay;

import com.incubyte.backend.integrations.razorpay.dto.request.OrderRequest;
import com.incubyte.backend.integrations.razorpay.dto.request.VerifyPaymentRequest;
import com.incubyte.backend.integrations.razorpay.dto.response.OrderResponse;
import com.razorpay.RazorpayException;

public interface RazorpayService {
    OrderResponse createOrder(OrderRequest request) throws RazorpayException;
    boolean verifyPaymentSignature(VerifyPaymentRequest request);
}
