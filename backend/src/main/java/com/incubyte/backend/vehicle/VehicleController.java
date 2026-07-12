package com.incubyte.backend.vehicle;

import com.incubyte.backend.common.ApiResponse;
import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

/**
 * Controller class providing RESTful endpoints for Vehicle resource management.
 * Access rules:
 * - Read endpoints (listing, retrieval, search) are accessible to all authenticated users.
 * - Write endpoints (creation, update, soft deletion) require the ROLE_ADMIN authority.
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Retrieves a paginated list of all active vehicles.
     *
     * @param pageable pagination parameters
     * @return 200 OK containing the paginated vehicles list
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getAllVehicles(Pageable pageable) {
        Page<VehicleResponse> vehicles = vehicleService.getAllVehicles(pageable);
        ApiResponse<Page<VehicleResponse>> response = ApiResponse.success("Vehicles retrieved successfully", vehicles);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Performs a dynamic query search on active vehicles with match filters.
     *
     * @param make     optional make query parameter
     * @param model    optional model query parameter
     * @param category optional category query parameter
     * @param minPrice optional minimum price query parameter
     * @param maxPrice optional maximum price query parameter
     * @param pageable pagination parameters
     * @return 200 OK containing matching paginated results
     */
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

    /**
     * Retrieves an active vehicle record by its ID.
     *
     * @param id vehicle identifier path variable
     * @return 200 OK containing vehicle detail payload
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle retrieved successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Creates a new vehicle record. Endpoint expects a multipart form-data request.
     *
     * @param request JSON serialized vehicle details part
     * @param image   optional multipart image file part
     * @return 201 Created containing the saved vehicle details
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @RequestPart("vehicle") @Valid VehicleRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        VehicleResponse vehicle = vehicleService.createVehicle(request, image);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle created successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Updates an existing active vehicle. Endpoint expects a multipart form-data request.
     *
     * @param id      vehicle identifier path variable
     * @param request JSON serialized updated vehicle details part
     * @param image   optional updated multipart image file part
     * @return 200 OK containing the updated vehicle details
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @RequestPart("vehicle") @Valid VehicleRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        VehicleResponse vehicle = vehicleService.updateVehicle(id, request, image);
        ApiResponse<VehicleResponse> response = ApiResponse.success("Vehicle updated successfully", vehicle);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Performs a soft delete on a vehicle record.
     *
     * @param id vehicle identifier path variable
     * @return 200 OK success indicator
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        ApiResponse<Void> response = ApiResponse.success("Vehicle deleted successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
