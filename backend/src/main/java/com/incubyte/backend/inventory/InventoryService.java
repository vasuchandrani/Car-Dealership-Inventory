package com.incubyte.backend.inventory;

import com.incubyte.backend.inventory.dto.request.PurchaseRequest;
import com.incubyte.backend.inventory.dto.request.RestockRequest;
import com.incubyte.backend.inventory.dto.response.PurchaseResponse;
import com.incubyte.backend.inventory.dto.response.RestockResponse;

import java.util.List;

public interface InventoryService {
    PurchaseResponse purchaseVehicle(Long id, PurchaseRequest request, String userEmail);
    RestockResponse restockVehicle(Long id, RestockRequest request);
    List<PurchaseResponse> getUserPurchases(String userEmail);
}
