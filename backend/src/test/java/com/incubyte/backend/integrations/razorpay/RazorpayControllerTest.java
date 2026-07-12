package com.incubyte.backend.integrations.razorpay;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incubyte.backend.integrations.razorpay.dto.request.OrderRequest;
import com.incubyte.backend.integrations.razorpay.dto.request.VerifyPaymentRequest;
import com.incubyte.backend.integrations.razorpay.dto.response.OrderResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RazorpayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RazorpayService razorpayService;

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void createOrder_success() throws Exception {
        OrderRequest request = new OrderRequest(new BigDecimal("1000.00"), "INR", "receipt_1");
        OrderResponse response = new OrderResponse("order_123", "INR", 100000, "created", "key_id");

        when(razorpayService.createOrder(any(OrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payments/order")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderId").value("order_123"));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void verifyPayment_success() throws Exception {
        VerifyPaymentRequest request = new VerifyPaymentRequest("order_123", "pay_123", "valid_sig");

        when(razorpayService.verifyPaymentSignature(any(VerifyPaymentRequest.class))).thenReturn(true);

        mockMvc.perform(post("/api/payments/verify")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void verifyPayment_failed() throws Exception {
        VerifyPaymentRequest request = new VerifyPaymentRequest("order_123", "pay_123", "invalid_sig");

        when(razorpayService.verifyPaymentSignature(any(VerifyPaymentRequest.class))).thenReturn(false);

        mockMvc.perform(post("/api/payments/verify")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").value(false));
    }
}
