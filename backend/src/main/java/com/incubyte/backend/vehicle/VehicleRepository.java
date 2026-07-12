package com.incubyte.backend.vehicle;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByIdAndIsDeletedFalse(Long id);

    Page<Vehicle> findByIsDeletedFalse(Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE v.isDeleted = false " +
            "AND (CAST(:make AS string) IS NULL OR LOWER(v.make) LIKE LOWER(CONCAT('%', CAST(:make AS string), '%'))) " +
            "AND (CAST(:model AS string) IS NULL OR LOWER(v.model) LIKE LOWER(CONCAT('%', CAST(:model AS string), '%'))) " +
            "AND (CAST(:category AS string) IS NULL OR LOWER(v.category) = LOWER(CAST(:category AS string))) " +
            "AND (:minPrice IS NULL OR v.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR v.price <= :maxPrice)")
    Page<Vehicle> searchVehicles(
            @Param("make") String make,
            @Param("model") String model,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
}
