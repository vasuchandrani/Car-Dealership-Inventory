package com.incubyte.backend.vehicle;

import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

/**
 * Service interface for managing vehicle inventory records.
 * Provides CRUD operations, soft deletion, and paginated dynamic search capabilities.
 */
public interface VehicleService {

    /**
     * Retrieves a paginated list of all active (non-deleted) vehicles in the inventory.
     *
     * @param pageable pagination and sorting information
     * @return a page of vehicle response objects
     */
    Page<VehicleResponse> getAllVehicles(Pageable pageable);

    /**
     * Retrieves an active vehicle record by its unique identifier.
     *
     * @param id the vehicle identifier
     * @return the vehicle response object
     * @throws com.incubyte.backend.common.ResourceNotFoundException if no active vehicle is found with the given id
     */
    VehicleResponse getVehicleById(Long id);

    /**
     * Creates a new vehicle record and uploads the associated image if provided.
     *
     * @param request the request DTO containing vehicle properties
     * @param image   the optional multipart image file
     * @return the newly created vehicle response object
     */
    VehicleResponse createVehicle(VehicleRequest request, MultipartFile image);

    /**
     * Updates an existing active vehicle record with new properties and an optional new image.
     *
     * @param id      the identifier of the vehicle to update
     * @param request the request DTO containing new vehicle properties
     * @param image   the optional new multipart image file
     * @return the updated vehicle response object
     * @throws com.incubyte.backend.common.ResourceNotFoundException if no active vehicle is found with the given id
     */
    VehicleResponse updateVehicle(Long id, VehicleRequest request, MultipartFile image);

    /**
     * Performs a soft delete on a vehicle by marking it as deleted.
     *
     * @param id the identifier of the vehicle to soft delete
     * @throws com.incubyte.backend.common.ResourceNotFoundException if no active vehicle is found with the given id
     */
    void deleteVehicle(Long id);

    /**
     * Dynamically searches active vehicles using matching filters.
     *
     * @param make     optional manufacturer filter
     * @param model    optional model filter
     * @param category optional category filter (e.g., Sedan, SUV)
     * @param minPrice optional minimum price filter
     * @param maxPrice optional maximum price filter
     * @param pageable pagination and sorting information
     * @return a page of matching vehicle response objects
     */
    Page<VehicleResponse> searchVehicles(
            String make,
            String model,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
}
