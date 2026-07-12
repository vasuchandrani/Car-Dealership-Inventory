package com.incubyte.backend.integrations.razorpay;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${RAZORPAY_KEY_ID:}")
    private String keyId;

    @Value("${RAZORPAY_KEY_SECRET:}")
    private String keySecret;

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }
}
