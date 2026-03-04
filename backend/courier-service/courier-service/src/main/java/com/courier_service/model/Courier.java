package com.courier_service.model;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String phone;
    private String email;
    private String vehicleType;   // moto, voiture

    // NOUVEAUX CHAMPS
    @Column(name = "delivery_zone")
    private String deliveryZone; // ex: "Casablanca", "Rabat"

    @Column(name = "current_load")
    private Integer currentLoad; // Nombre de colis actuellement assignés
    private String status;        // AVAILABLE, BUSY, OFFLINE



}
