package com.incubyte.backend.vehicle;

import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Override
    public Page<VehicleResponse> getAllVehicles(Pageable pageable) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public VehicleResponse createVehicle(VehicleRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void deleteVehicle(Long id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public Page<VehicleResponse> searchVehicles(
            String make,
            String model,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
