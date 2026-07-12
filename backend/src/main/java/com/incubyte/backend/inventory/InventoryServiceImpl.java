package com.incubyte.backend.inventory;

import com.incubyte.backend.inventory.dto.request.PurchaseRequest;
import com.incubyte.backend.inventory.dto.request.RestockRequest;
import com.incubyte.backend.inventory.dto.response.PurchaseResponse;
import com.incubyte.backend.inventory.dto.response.RestockResponse;
import org.springframework.stereotype.Service;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Override
    public PurchaseResponse purchaseVehicle(Long id, PurchaseRequest request, String userEmail) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public RestockResponse restockVehicle(Long id, RestockRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
