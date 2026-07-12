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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final RazorpayService razorpayService;

    @Override
    @Transactional
    public PurchaseResponse purchaseVehicle(Long id, PurchaseRequest request, String userEmail) {
        Vehicle vehicle = vehicleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Integrate Razorpay signature verification
        VerifyPaymentRequest verifyRequest = new VerifyPaymentRequest(
                request.razorpayOrderId(),
                request.razorpayPaymentId(),
                request.razorpaySignature()
        );
        boolean isPaymentValid = razorpayService.verifyPaymentSignature(verifyRequest);
        if (!isPaymentValid) {
            throw new BadRequestException("Payment signature verification failed");
        }

        if (vehicle.getQuantity() < request.quantity()) {
            throw new BadRequestException("Sufficient vehicle stock not available. Available stock: " + vehicle.getQuantity());
        }

        vehicle.setQuantity(vehicle.getQuantity() - request.quantity());
        vehicleRepository.save(vehicle);

        Purchase purchase = Purchase.builder()
                .user(user)
                .vehicle(vehicle)
                .purchasePrice(vehicle.getPrice())
                .quantity(request.quantity())
                .razorpayOrderId(request.razorpayOrderId())
                .razorpayPaymentId(request.razorpayPaymentId())
                .razorpaySignature(request.razorpaySignature())
                .build();

        Purchase savedPurchase = purchaseRepository.save(purchase);

        return new PurchaseResponse(
                savedPurchase.getId(),
                vehicle.getId(),
                vehicle.getMake(),
                vehicle.getModel(),
                savedPurchase.getQuantity(),
                savedPurchase.getPurchasePrice(),
                user.getEmail(),
                savedPurchase.getPurchasedAt()
        );
    }

    @Override
    @Transactional
    public RestockResponse restockVehicle(Long id, RestockRequest request) {
        if (request.quantity() <= 0) {
            throw new BadRequestException("Quantity to restock must be greater than zero");
        }

        Vehicle vehicle = vehicleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setQuantity(vehicle.getQuantity() + request.quantity());
        vehicleRepository.save(vehicle);

        return new RestockResponse(
                vehicle.getId(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getQuantity()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseResponse> getUserPurchases(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return purchaseRepository.findByUserId(user.getId()).stream()
                .map(purchase -> new PurchaseResponse(
                        purchase.getId(),
                        purchase.getVehicle().getId(),
                        purchase.getVehicle().getMake(),
                        purchase.getVehicle().getModel(),
                        purchase.getQuantity(),
                        purchase.getPurchasePrice(),
                        user.getEmail(),
                        purchase.getPurchasedAt()
                ))
                .collect(Collectors.toList());
    }
}
