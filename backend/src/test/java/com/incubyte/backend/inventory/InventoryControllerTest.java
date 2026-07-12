package com.incubyte.backend.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incubyte.backend.inventory.dto.request.PurchaseRequest;
import com.incubyte.backend.inventory.dto.request.RestockRequest;
import com.incubyte.backend.inventory.dto.response.PurchaseResponse;
import com.incubyte.backend.inventory.dto.response.RestockResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    @WithMockUser(username = "user@example.com", authorities = {"ROLE_USER"})
    void purchaseVehicle_asUser_success() throws Exception {
        PurchaseRequest request = new PurchaseRequest(1, "order_123", "pay_123", "sig_123");
        PurchaseResponse response = new PurchaseResponse(
                10L, 1L, "Toyota", "Camry", 1, new BigDecimal("25000"), "user@example.com", LocalDateTime.now()
        );

        when(inventoryService.purchaseVehicle(eq(1L), any(PurchaseRequest.class), eq("user@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/inventory/vehicles/1/purchase")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.vehicleMake").value("Toyota"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = {"ROLE_ADMIN"})
    void restockVehicle_asAdmin_success() throws Exception {
        RestockRequest request = new RestockRequest(10);
        RestockResponse response = new RestockResponse(1L, "Toyota", "Camry", 15);

        when(inventoryService.restockVehicle(eq(1L), any(RestockRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/inventory/vehicles/1/restock")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.updatedQuantity").value(15));
    }

    @Test
    @WithMockUser(username = "user@example.com", authorities = {"ROLE_USER"})
    void restockVehicle_asUser_forbidden() throws Exception {
        RestockRequest request = new RestockRequest(10);

        mockMvc.perform(post("/api/inventory/vehicles/1/restock")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
