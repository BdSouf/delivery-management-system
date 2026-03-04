package com.package_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "packages")
@Data // Génère automatiquement getters, setters, toString, etc. (Lombok)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PackageStatus status;

    @Column(nullable = false)
    private String description;

    // Informations sur l'expéditeur (le client)
    @Column(name = "sender_address", nullable = false)
    private String senderAddress;

    // Informations sur le destinataire
    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false)
    private String recipientPhone;


    // NOUVEAU CHAMP : La ville de livraison, fournie par le client
    @Column(name = "recipient_city", nullable = false)
    private String recipientCity;

    // On renomme deliveryZone pour que ce soit plus clair
    @Column(name = "delivery_zone", nullable = false)
    private String deliveryZone;



//    @Column(name = "recipient_address", nullable = false)
//    private String recipientAddress;

    @Column(name = "recipient_address", nullable = false)
    private String recipientAddress;

    @Column(nullable = false)
    private Double weight;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "delivery_cost", precision = 10, scale = 2)
    private BigDecimal deliveryCost;

    @CreationTimestamp // Met automatiquement la date de création
    @Column(name = "pickup_date", updatable = false)
    private LocalDateTime pickupDate;



    @UpdateTimestamp // Met automatiquement la date de la dernière mise à jour
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    // Clés étrangères
    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "courier_id")
    private Long courierId;// nullable car le livreur est assigné plus tard



    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}