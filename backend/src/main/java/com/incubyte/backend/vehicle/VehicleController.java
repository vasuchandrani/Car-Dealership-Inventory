package com.incubyte.backend.vehicle;

import com.incubyte.backend.common.ApiResponse;
import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getAllVehicles(Pageable pageable) {
        Page<VehicleResponse> vehicles = vehicleService.getAllVehicles(pageable);
        ApiResponse<Page<VehicleResponse>> response = ApiResponse.success("Vehicles retrieved successfully", vehicles);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> searchVehicles(
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable
    ) {
        Page<VehicleResponse> vehicles = vehicleService.searchVehicles(make, model, category, minPrice, maxPrice, pageable);
        ApiResponse<Page<VehicleResponse>> response = ApiResponse.success("Search results retrieved successfully", vehicles);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle retrieved successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.createVehicle(request);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle created successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {
        VehicleResponse vehicle = vehicleService.updateVehicle(id, request);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle updated successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        ApiResponse<Void> response = ApiResponse.success("Vehicle deleted successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
