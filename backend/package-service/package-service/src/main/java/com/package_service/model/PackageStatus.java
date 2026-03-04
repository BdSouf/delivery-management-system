package com.package_service.model;


import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum PackageStatus {
    PREPARATION,    // Le colis est créé, en attente d'assignation
    ASSIGNED,       // Un livreur a été assigné
    IN_TRANSIT,     // Le livreur est en route pour la livraison
    DELIVERED,      // Le colis a été livré
    CANCELLED       // Le colis a été annulé
}