package com.package_service.repository;



import com.package_service.model.Package;
import com.package_service.model.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PackageRepository extends JpaRepository<Package, Long> {

//    List<Package> findByClientId(Long clientId);

    // Trouver un colis par son numéro de suivi unique
    Optional<Package> findByTrackingNumber(String trackingNumber);

    // Trouver tous les colis pour un client donné
    List<Package> findByClientId(Long clientId);

    // Trouver tous les colis assignés à un livreur donné
    List<Package> findByCourierId(Long courierId);

    // Trouver tous les colis par statut
    List<Package> findByStatus(PackageStatus status);
    Optional<Package> findFirstByStatus(PackageStatus status);
}

