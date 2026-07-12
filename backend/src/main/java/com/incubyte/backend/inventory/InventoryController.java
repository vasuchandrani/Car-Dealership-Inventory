package com.incubyte.backend.inventory;

import com.incubyte.backend.common.ApiResponse;
import com.incubyte.backend.inventory.dto.request.PurchaseRequest;
import com.incubyte.backend.inventory.dto.request.RestockRequest;
import com.incubyte.backend.inventory.dto.response.PurchaseResponse;
import com.incubyte.backend.inventory.dto.response.RestockResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/vehicles")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<List<PurchaseResponse>>> getUserPurchases(Principal principal) {
        List<PurchaseResponse> responseData = inventoryService.getUserPurchases(principal.getName());
        ApiResponse<List<PurchaseResponse>> apiResponse = ApiResponse.success("Purchases retrieved successfully", responseData);
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<ApiResponse<PurchaseResponse>> purchaseVehicle(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequest request,
            Principal principal
    ) {
        PurchaseResponse responseData = inventoryService.purchaseVehicle(id, request, principal.getName());
        ApiResponse<PurchaseResponse> apiResponse = ApiResponse.success("Vehicle purchased successfully", responseData);
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @PostMapping("/{id}/restock")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<RestockResponse>> restockVehicle(
            @PathVariable Long id,
            @Valid @RequestBody RestockRequest request
    ) {
        RestockResponse responseData = inventoryService.restockVehicle(id, request);
        ApiResponse<RestockResponse> apiResponse = ApiResponse.success("Vehicle restocked successfully", responseData);
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}
