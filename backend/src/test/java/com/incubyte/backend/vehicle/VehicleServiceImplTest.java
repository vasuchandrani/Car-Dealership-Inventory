package com.incubyte.backend.vehicle;

import com.incubyte.backend.common.ResourceNotFoundException;
import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Spy
    private VehicleMapper vehicleMapper = new VehicleMapper();

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllVehicles_returnsList() {
        Pageable pageable = PageRequest.of(0, 20);
        Vehicle vehicle = Vehicle.builder().id(1L).make("Toyota").model("Camry").isDeleted(false).build();
        Page<Vehicle> vehiclePage = new PageImpl<>(Collections.singletonList(vehicle), pageable, 1);

        when(vehicleRepository.findByIsDeletedFalse(pageable)).thenReturn(vehiclePage);

        Page<VehicleResponse> result = vehicleService.getAllVehicles(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Toyota", result.getContent().get(0).make());
    }

    @Test
    void getVehicleById_success() {
        Vehicle vehicle = Vehicle.builder().id(1L).make("Toyota").model("Camry").isDeleted(false).build();
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(vehicle));

        VehicleResponse result = vehicleService.getVehicleById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Toyota", result.make());
    }

    @Test
    void getVehicleById_notFound_throws() {
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById(1L));
    }

    @Test
    void createVehicle_success() {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("25000"), 5,
                2024, "White", "Petrol", "Automatic", "2.5L", 5, "Nice sedan"
        );
        Vehicle savedVehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .model("Camry")
                .category("Sedan")
                .price(new BigDecimal("25000"))
                .quantity(5)
                .isDeleted(false)
                .build();

        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(savedVehicle);

        VehicleResponse result = vehicleService.createVehicle(request);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Toyota", result.make());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_success() {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("26000"), 4,
                2024, "Black", "Petrol", "Automatic", "2.5L", 5, "Updated sedan"
        );
        Vehicle existingVehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .model("Camry")
                .category("Sedan")
                .price(new BigDecimal("25000"))
                .quantity(5)
                .isDeleted(false)
                .build();

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(existingVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse result = vehicleService.updateVehicle(1L, request);

        assertNotNull(result);
        assertEquals(new BigDecimal("26000"), result.price());
        assertEquals(4, result.quantity());
        assertEquals("Black", result.color());
    }

    @Test
    void updateVehicle_notFound_throws() {
        VehicleRequest request = new VehicleRequest(
                "Toyota", "Camry", "Sedan", new BigDecimal("26000"), 4,
                null, null, null, null, null, null, null
        );
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.updateVehicle(1L, request));
    }

    @Test
    void deleteVehicle_success() {
        Vehicle existingVehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .isDeleted(false)
                .build();

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(existingVehicle));

        vehicleService.deleteVehicle(1L);

        assertTrue(existingVehicle.getIsDeleted());
        verify(vehicleRepository, times(1)).save(existingVehicle);
    }

    @Test
    void deleteVehicle_notFound_throws() {
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.deleteVehicle(1L));
    }

    @Test
    void searchVehicles_returnsFilteredList() {
        Pageable pageable = PageRequest.of(0, 20);
        Vehicle vehicle = Vehicle.builder().id(1L).make("Honda").model("Civic").category("Sedan").isDeleted(false).build();
        Page<Vehicle> vehiclePage = new PageImpl<>(Collections.singletonList(vehicle), pageable, 1);

        when(vehicleRepository.searchVehicles(eq("Honda"), eq("Civic"), eq("Sedan"), any(), any(), eq(pageable)))
                .thenReturn(vehiclePage);

        Page<VehicleResponse> result = vehicleService.searchVehicles("Honda", "Civic", "Sedan", null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Honda", result.getContent().get(0).make());
    }
}
