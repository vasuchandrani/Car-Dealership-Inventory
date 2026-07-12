package com.incubyte.backend.vehicle;

import com.incubyte.backend.common.ResourceNotFoundException;
import com.incubyte.backend.integrations.cloudinary.CloudinaryService;
import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

/**
 * Service implementation for managing vehicle inventory.
 * Business logic for CRUD operations, soft delete, and dynamic search.
 */
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final CloudinaryService cloudinaryService;

    /**
     * Uploads the vehicle image file to Cloudinary if it is present and sets the image URL.
     *
     * @param vehicle the vehicle entity to associate the image with
     * @param image   the optional multipart image file
     */
    private void uploadVehicleImage(Vehicle vehicle, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return;
        }

        try {
            String imageUrl = cloudinaryService.uploadImage(image);
            vehicle.setImageUrl(imageUrl);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public Page<VehicleResponse> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findByIsDeletedFalse(pageable)
                .map(vehicleMapper::toResponse);
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return vehicleMapper.toResponse(vehicle);
    }

    @Override
    public VehicleResponse createVehicle(VehicleRequest request, MultipartFile image) {
        Vehicle vehicle = vehicleMapper.toEntity(request);

        uploadVehicleImage(vehicle, image);

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(savedVehicle);
    }

    @Override
    public VehicleResponse updateVehicle(Long id, VehicleRequest request, MultipartFile image) {
        Vehicle vehicle = vehicleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setMake(request.make());
        vehicle.setModel(request.model());
        vehicle.setCategory(request.category());
        vehicle.setPrice(request.price());
        vehicle.setQuantity(request.quantity());
        vehicle.setYear(request.year());
        vehicle.setColor(request.color());
        vehicle.setFuelType(request.fuelType());
        vehicle.setTransmission(request.transmission());
        vehicle.setEngineCapacity(request.engineCapacity());
        vehicle.setSeatingCapacity(request.seatingCapacity());
        vehicle.setDescription(request.description());

        uploadVehicleImage(vehicle, image);

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(updatedVehicle);
    }

    @Override
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setIsDeleted(true);
        vehicleRepository.save(vehicle);
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
        return vehicleRepository.searchVehicles(make, model, category, minPrice, maxPrice, pageable)
                .map(vehicleMapper::toResponse);
    }
}
