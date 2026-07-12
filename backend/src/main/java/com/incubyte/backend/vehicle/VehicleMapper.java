package com.incubyte.backend.vehicle;

import com.incubyte.backend.vehicle.dto.request.VehicleRequest;
import com.incubyte.backend.vehicle.dto.response.VehicleResponse;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleRequest request) {
        if (request == null) {
            return null;
        }
        return Vehicle.builder()
                .make(request.make())
                .model(request.model())
                .category(request.category())
                .price(request.price())
                .quantity(request.quantity())
                .year(request.year())
                .color(request.color())
                .fuelType(request.fuelType())
                .transmission(request.transmission())
                .engineCapacity(request.engineCapacity())
                .seatingCapacity(request.seatingCapacity())
                .description(request.description())
                .build();
    }

    public VehicleResponse toResponse(Vehicle entity) {
        if (entity == null) {
            return null;
        }
        return new VehicleResponse(
                entity.getId(),
                entity.getMake(),
                entity.getModel(),
                entity.getCategory(),
                entity.getPrice(),
                entity.getQuantity(),
                entity.getYear(),
                entity.getColor(),
                entity.getFuelType(),
                entity.getTransmission(),
                entity.getEngineCapacity(),
                entity.getSeatingCapacity(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
