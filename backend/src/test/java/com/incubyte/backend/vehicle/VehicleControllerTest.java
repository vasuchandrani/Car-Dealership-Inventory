package com.incubyte.backend.vehicle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incubyte.backend.common.ResourceNotFoundException;
import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VehicleService vehicleService;

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void getAllVehicles_success() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        VehicleResponse response = new VehicleResponse(
                1L, "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan",
                "http://image.url", LocalDateTime.now(), LocalDateTime.now()
        );
        Page<VehicleResponse> page = new PageImpl<>(Collections.singletonList(response), pageable, 1);

        when(vehicleService.getAllVehicles(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/vehicles")
                        .param("page", "0")
                        .param("size", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].make").value("Toyota"));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void getVehicleById_success() throws Exception {
        VehicleResponse response = new VehicleResponse(
                1L, "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan",
                "http://image.url", LocalDateTime.now(), LocalDateTime.now()
        );

        when(vehicleService.getVehicleById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.make").value("Toyota"));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void getVehicleById_notFound() throws Exception {
        when(vehicleService.getVehicleById(1L)).thenThrow(new ResourceNotFoundException("Vehicle not found"));

        mockMvc.perform(get("/api/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Vehicle not found"));
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN"})
    void createVehicle_asAdmin_success() throws Exception {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan"
        );
        VehicleResponse response = new VehicleResponse(
                1L, "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan",
                null, LocalDateTime.now(), LocalDateTime.now()
        );

        when(vehicleService.createVehicle(any(VehicleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/vehicles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.make").value("Toyota"));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void createVehicle_asUser_forbidden() throws Exception {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan"
        );

        mockMvc.perform(post("/api/vehicles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN"})
    void updateVehicle_asAdmin_success() throws Exception {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("26000"), 4,
                2024, "Black", "Petrol", "Automatic", "2.5L", 5, "Updated sedan"
        );
        VehicleResponse response = new VehicleResponse(
                1L, "Toyota", "Camry", "Sedan", new BigDecimal("26000"), 4,
                2024, "Black", "Petrol", "Automatic", "2.5L", 5, "Updated sedan",
                null, LocalDateTime.now(), LocalDateTime.now()
        );

        when(vehicleService.updateVehicle(eq(1L), any(VehicleRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/vehicles/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.price").value(26000));
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ROLE_ADMIN"})
    void deleteVehicle_asAdmin_success() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(1L);

        mockMvc.perform(delete("/api/vehicles/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Vehicle deleted successfully"));

        verify(vehicleService, times(1)).deleteVehicle(1L);
    }

    @Test
    @WithMockUser(username = "user", authorities = {"ROLE_USER"})
    void searchVehicles_success() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        VehicleResponse response = new VehicleResponse(
                1L, "Honda", "Civic", "Sedan", new BigDecimal("20000"), 5,
                2024, "Blue", "Petrol", "Manual", "2.0L", 5, "Sporty sedan",
                null, LocalDateTime.now(), LocalDateTime.now()
        );
        Page<VehicleResponse> page = new PageImpl<>(Collections.singletonList(response), pageable, 1);

        when(vehicleService.searchVehicles(eq("Honda"), eq("Civic"), eq("Sedan"), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/vehicles/search")
                        .param("make", "Honda")
                        .param("model", "Civic")
                        .param("category", "Sedan")
                        .param("page", "0")
                        .param("size", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].make").value("Honda"));
    }
}
