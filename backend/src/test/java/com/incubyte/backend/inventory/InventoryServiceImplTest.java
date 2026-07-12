package com.incubyte.backend.inventory;

import com.incubyte.backend.common.BadRequestException;
import com.incubyte.backend.common.ResourceNotFoundException;
import com.incubyte.backend.integrations.razorpay.RazorpayService;
import com.incubyte.backend.integrations.razorpay.dto.request.VerifyPaymentRequest;
import com.incubyte.backend.inventory.dto.request.PurchaseRequest;
import com.incubyte.backend.inventory.dto.request.RestockRequest;
import com.incubyte.backend.inventory.dto.response.PurchaseResponse;
import com.incubyte.backend.inventory.dto.response.RestockResponse;
import com.incubyte.backend.user.User;
import com.incubyte.backend.user.UserRepository;
import com.incubyte.backend.vehicle.Vehicle;
import com.incubyte.backend.vehicle.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private RazorpayService razorpayService;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void purchaseVehicle_success() {
        Vehicle vehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .model("Camry")
                .price(new BigDecimal("25000"))
                .quantity(5)
                .isDeleted(false)
                .build();

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        PurchaseRequest request = new PurchaseRequest(1, "order_123", "pay_123", "valid_sig");

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(razorpayService.verifyPaymentSignature(any(VerifyPaymentRequest.class))).thenReturn(true);
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(invocation -> {
            Purchase p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });

        PurchaseResponse response = inventoryService.purchaseVehicle(1L, request, "user@example.com");

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals(4, vehicle.getQuantity());
        verify(vehicleRepository, times(1)).save(vehicle);
        verify(purchaseRepository, times(1)).save(any(Purchase.class));
    }

    @Test
    void purchaseVehicle_outOfStock_throws() {
        Vehicle vehicle = Vehicle.builder()
                .id(1L)
                .quantity(0)
                .isDeleted(false)
                .build();

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        PurchaseRequest request = new PurchaseRequest(1, "order_123", "pay_123", "valid_sig");

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(razorpayService.verifyPaymentSignature(any(VerifyPaymentRequest.class))).thenReturn(true);

        assertThrows(BadRequestException.class, () ->
                inventoryService.purchaseVehicle(1L, request, "user@example.com"));
    }

    @Test
    void purchaseVehicle_notFound_throws() {
        PurchaseRequest request = new PurchaseRequest(1, "order_123", "pay_123", "valid_sig");
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                inventoryService.purchaseVehicle(1L, request, "user@example.com"));
    }

    @Test
    void purchaseVehicle_invalidPaymentSignature_throws() {
        Vehicle vehicle = Vehicle.builder()
                .id(1L)
                .quantity(5)
                .isDeleted(false)
                .build();

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        PurchaseRequest request = new PurchaseRequest(1, "order_123", "pay_123", "invalid_sig");

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(vehicle));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(razorpayService.verifyPaymentSignature(any(VerifyPaymentRequest.class))).thenReturn(false);

        assertThrows(BadRequestException.class, () ->
                inventoryService.purchaseVehicle(1L, request, "user@example.com"));
    }

    @Test
    void restockVehicle_success() {
        Vehicle vehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .model("Camry")
                .quantity(5)
                .isDeleted(false)
                .build();

        RestockRequest request = new RestockRequest(10);

        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RestockResponse response = inventoryService.restockVehicle(1L, request);

        assertNotNull(response);
        assertEquals(15, response.updatedQuantity());
        assertEquals(15, vehicle.getQuantity());
        verify(vehicleRepository, times(1)).save(vehicle);
    }

    @Test
    void restockVehicle_invalidQuantity_throws() {
        RestockRequest request = new RestockRequest(-5);

        assertThrows(BadRequestException.class, () ->
                inventoryService.restockVehicle(1L, request));
    }

    @Test
    void restockVehicle_notFound_throws() {
        RestockRequest request = new RestockRequest(5);
        when(vehicleRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                inventoryService.restockVehicle(1L, request));
    }
}
