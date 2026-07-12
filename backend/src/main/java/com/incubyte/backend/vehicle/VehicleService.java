package com.incubyte.backend.vehicle;

import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface VehicleService {
    Page<VehicleResponse> getAllVehicles(Pageable pageable);

    VehicleResponse getVehicleById(Long id);

    VehicleResponse createVehicle(VehicleRequest request, MultipartFile image);

    VehicleResponse updateVehicle(Long id, VehicleRequest request, MultipartFile image);

    void deleteVehicle(Long id);

    Page<VehicleResponse> searchVehicles(
            String make,
            String model,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
}
