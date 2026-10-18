package com.package_service.service;

import com.package_service.model.Package;
import com.package_service.model.PackageStatus;
import com.package_service.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import java.security.Principal;

@Service
public class PackageService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    @Value("${courier.service.url}")
    private String courierServiceUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    private final PackageRepository repository;

    public PackageService(PackageRepository repository) {
        this.repository = repository;
    }


    private static final BigDecimal BASE_RATE = new BigDecimal("5.00"); // Tarif de base
    private static final BigDecimal PRICE_PER_KG = new BigDecimal("2.50"); // Prix par kg

    // Un multiplicateur basé sur la "distance" simulée par la ville de destination
    private static final Map<String, Double> CITY_MULTIPLIERS = new HashMap<>();
    static {
        CITY_MULTIPLIERS.put("casablanca", 1.0);
        CITY_MULTIPLIERS.put("rabat", 0.9);
        CITY_MULTIPLIERS.put("fes", 1.1);
        CITY_MULTIPLIERS.put("marrakech", 1.2);
        CITY_MULTIPLIERS.put("Tanger", 2.2);
        // Ajoutez d'autres villes au besoin
    }


    /**
     * Calcule le prix d'un colis en fonction de son poids et de sa ville de destination.
     */
    private BigDecimal calculatePrice(Package p) {
        // 1. Obtenir le poids
        double weight = p.getWeight();

        // 2. Obtenir le multiplicateur de la ville (par défaut à 1.0 si la ville n'est pas dans la liste)
        String city = p.getRecipientCity().toLowerCase();
        double multiplier = CITY_MULTIPLIERS.getOrDefault(city, 1.0);

        // 3. Calculer le prix
        // Prix = Tarif de base + (Poids * Prix par kg) * Multiplicateur de ville
        BigDecimal weightCost = PRICE_PER_KG.multiply(new BigDecimal(weight));
        BigDecimal totalCost = BASE_RATE.add(weightCost).multiply(new BigDecimal(multiplier));

        // 4. Arrondir à 2 décimales (standard monétaire)
        return totalCost.setScale(2, RoundingMode.HALF_UP);
    }

    // ... (vos autres méthodes comme create, updateStatus, etc. restent inchangées)
    public Package create(Package p) {
        p.setTrackingNumber(generateTrackingNumber());
        p.setStatus(PackageStatus.PREPARATION);
        p.setPickupDate(LocalDateTime.now());

        // - Calculer et définir le prix ---
        BigDecimal calculatedPrice = calculatePrice(p);
        p.setPrice(calculatedPrice);
        System.out.println("Prix calculé pour le colis " + p.getTrackingNumber() + " : " + calculatedPrice + " MAD");


        p.setDeliveryZone(p.getRecipientCity());
        return repository.save(p);
    }

    /**
     * Met à jour le statut d'un colis de manière sécurisée.
     * Vérifie que le colis appartient au livreur connecté et met à jour sa charge de travail.
     */
    public Package updateStatus(Long packageId, PackageStatus newStatus, Principal principal) {
        // --- DÉBOGAGE : Affichons les IDs pour la comparaison ---
        System.out.println("=== UPDATE STATUS DEBUG ===");
        System.out.println("Package ID from request: " + packageId);
        // -------------------------------------------------------------

        // 1. Trouver le colis
        Package p = repository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé avec l'id: " + packageId));

        // --- DÉBOGAGE : Affichons l'ID du colis trouvé ---
        System.out.println("Found package. Package courierId: " + p.getCourierId());
        // -------------------------------------------------------------

        // 2. SÉCURITÉ : Vérifier que le colis appartient au livreur connecté
        String loggedInCourierEmail = principal.getName();
        Long loggedInCourierId = getCourierIdFromEmail(loggedInCourierEmail);

        // --- DÉBOGAGE : Affichons l'ID du livreur connecté ---
        System.out.println("Logged-in user email: " + loggedInCourierEmail);
        System.out.println("Resolved logged-in courier ID: " + loggedInCourierId);
        // -------------------------------------------------------------

        if (loggedInCourierId == null) {
            throw new RuntimeException("Utilisateur non trouvé en tant que livreur.");
        }

        // --- DÉBOGAGE : Affichons le résultat de la comparaison ---
        if (!p.getCourierId().equals(loggedInCourierId)) {
            System.out.println("SECURITY CHECK FAILED: Package courierId (" + p.getCourierId() + ") is NOT equal to logged-in courierId (" + loggedInCourierId + ")");
            throw new RuntimeException("Action non autorisée : Ce colis ne vous est pas assigné.");
        } else {
            System.out.println("SECURITY CHECK PASSED!");
        }
        // -------------------------------------------------------------

        // ... le reste de votre méthode (inchangé)
        p.setStatus(newStatus);
        if (newStatus == PackageStatus.DELIVERED) {
            p.setDeliveryDate(LocalDateTime.now());
        }

        Package updatedPackage = repository.save(p);

        if (newStatus == PackageStatus.DELIVERED) {
            decrementCourierLoad(p.getCourierId());
        }

        System.out.println("=== END UPDATE STATUS DEBUG ===");
        return updatedPackage;
    }

    /**
     * Appelle le courier-service pour décrémenter la charge de travail d'un livreur.
     */
    private void decrementCourierLoad(Long courierId) {
        try {
            // D'abord, on récupère la charge actuelle du livreur
            String getCourierUrl = courierServiceUrl + "/api/couriers/" + courierId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-KEY", internalApiKey);
            HttpEntity<String> getEntity = new HttpEntity<>(headers);

            // On suppose que le courier-service a un endpoint GET /api/couriers/{id}
            ResponseEntity<Courier> response = restTemplate.exchange(getCourierUrl, HttpMethod.GET, getEntity, Courier.class);
            Courier courier = response.getBody();

            if (courier != null && courier.getCurrentLoad() > 0) {
                int newLoad = courier.getCurrentLoad() - 1;
                String updateLoadUrl = courierServiceUrl + "/api/couriers/" + courierId + "/load";
                HttpEntity<Map<String, Integer>> updateEntity = new HttpEntity<>(Map.of("load", newLoad), headers);
                restTemplate.exchange(updateLoadUrl, HttpMethod.PUT, updateEntity, Void.class);
            }
        } catch (Exception e) {
            System.err.println("ERREUR CRITIQUE: Impossible de décrémenter la charge du livreur " + courierId);
        }
    }

    public Package getByTrackingNumber(String trackingNumber) {
        return repository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé avec le numéro de suivi: " + trackingNumber));
    }

    public List<Package> getClientPackages(Long clientId) {
        return repository.findByClientId(clientId);
    }

    public List<Package> getCourierPackages(Long courierId) {
        return repository.findByCourierId(courierId);
    }

    public List<Package> getAllPackages() {
        return repository.findAll();
    }

    public Long getClientIdFromEmail(String email) {
        // ... (votre code existant)
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-INTERNAL-KEY", internalApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        String url = userServiceUrl + "/internal/users/id-by-email/" + email;

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("userId")) {
                return ((Number) response.getBody().get("userId")).longValue();
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel à user-service pour l'email " + email + " : " + e.getMessage());
        }
        return null;
    }

    public Long getCourierIdFromEmail(String email) {
        // ... (votre code existant)
        try {
            String url = courierServiceUrl + "/internal/couriers/id-by-email/" + email;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-KEY", internalApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("courierId")) {
                return ((Number) response.getBody().get("courierId")).longValue();
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel à courier-service pour l'email " + email + " : " + e.getMessage());
        }
        return null;
    }

    public List<Package> getCourierAssignments(String courierEmail) {
        Long courierId = getCourierIdFromEmail(courierEmail);
        if (courierId == null) {
            return List.of();
        }
        return repository.findByCourierId(courierId);
    }

    private String generateTrackingNumber() {
        Random random = new Random();
        int number = 10000000 + random.nextInt(90000000);
        return "TRK-" + number;
    }



    /**
     * NOUVELLE logique de dispatching : trouve le meilleur livreur disponible.
     */
    /**
     * NOUVELLE logique de dispatching : trouve le PREMIER colis dispatchable.
     * Un colis est dispatchable s'il existe un livreur disponible dans sa ville.
     */
    public Package dispatchNextPackage() {
        // 1. Obtenir TOUS les colis avec le statut PREPARATION
        List<Package> pendingPackages = repository.findByStatus(PackageStatus.PREPARATION);

        if (pendingPackages.isEmpty()) {
            throw new RuntimeException("Aucun colis à dispatcher (statut PREPARATION).");
        }

        // 2. Obtenir la liste de tous les livreurs actifs
        List<Courier> allCouriers = getAllCouriers(); // On extrait cela dans une méthode privée
        if (allCouriers.isEmpty()) {
            throw new RuntimeException("Aucun livreur actif disponible.");
        }

        // 3. Boucler sur les colis en attente pour en trouver un dispatchable
        for (Package packageToDispatch : pendingPackages) {
            // La ville de livraison est maintenant directement disponible
            String deliveryCity = packageToDispatch.getRecipientCity();
            packageToDispatch.setDeliveryZone(deliveryCity); // On met à jour la zone

            // 4. Filtrer les livreurs pour cette ville spécifique
            List<Courier> suitableCouriers = allCouriers.stream()
                    .filter(courier -> courier.getDeliveryZone().equalsIgnoreCase(deliveryCity))
                    .filter(courier -> {
                        int maxLoad = "voiture".equalsIgnoreCase(courier.getVehicleType()) ? 10 : 5;
                        return courier.getCurrentLoad() < maxLoad;
                    })
                    .collect(Collectors.toList());

            // 5. Si on trouve un livreur pour ce colis, on l'assigne
            if (!suitableCouriers.isEmpty()) {
                Courier bestCourier = suitableCouriers.stream()
                        .min((c1, c2) -> Integer.compare(c1.getCurrentLoad(), c2.getCurrentLoad()))
                        .orElseThrow(() -> new RuntimeException("Erreur lors de la sélection du livreur."));

                // 6. Mettre à jour le colis et le livreur
                packageToDispatch.setCourierId(bestCourier.getId());
                packageToDispatch.setStatus(PackageStatus.ASSIGNED);
                repository.save(packageToDispatch);

                updateCourierLoad(bestCourier.getId(), bestCourier.getCurrentLoad() + 1);

                // 7. Retourner le colis qui a été dispatché
                return packageToDispatch;
            }
        }

        // 8. Si on a parcouru tous les colis sans en trouver un dispatchable
        throw new RuntimeException("Aucun colis dispatchable. Vérifiez les zones de livraison ou la disponibilité des livreurs.");
    }

    // Méthode utilitaire pour appeler le courier-service
    private List<Courier> getAllCouriers() {
        try {
            String url = courierServiceUrl + "/api/couriers/all";
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-KEY", internalApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Courier>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity,
                    new ParameterizedTypeReference<List<Courier>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel à courier-service pour obtenir la liste des livreurs : " + e.getMessage());
            return List.of(); // Retourne une liste vide en cas d'erreur
        }
    }

    /**
     * Appelle le courier-service pour mettre à jour la charge de travail d'un livreur.
     */
    private void updateCourierLoad(Long courierId, int newLoad) {
        try {
            String url = courierServiceUrl + "/api/couriers/" + courierId + "/load";
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-KEY", internalApiKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Integer>> requestEntity = new HttpEntity<>(Map.of("load", newLoad), headers);
            restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Void.class);

        } catch (Exception e) {
            System.err.println("ERREUR CRITIQUE: Impossible de mettre à jour la charge du livreur " + courierId);
        }
    }

    /**
     * Extrait une zone de livraison simple à partir d'une adresse.
     */
    private String extractDeliveryZone(String address) {
        if (address == null) return "Inconnue";
        String lowerCaseAddress = address.toLowerCase();
        if (lowerCaseAddress.contains("casablanca") || lowerCaseAddress.contains("casa")) return "Casablanca";
        if (lowerCaseAddress.contains("rabat")) return "Rabat";
        if (lowerCaseAddress.contains("fes") || lowerCaseAddress.contains("fès")) return "Fes";
        // Ajoutez d'autres villes au besoin
        return "Autre";
    }





    /**
     * Permet à un client d'annuler son colis si le statut le permet
     */
    public Package cancelPackage(Long packageId, String clientEmail) {
        // 1. Récupérer le colis
        Package p = repository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé avec l'id: " + packageId));

        // 2. Vérifier que le colis appartient bien au client connecté
        Long clientId = getClientIdFromEmail(clientEmail);
        if (!p.getClientId().equals(clientId)) {
            throw new RuntimeException("Action non autorisée : Ce colis ne vous appartient pas.");
        }

        // 3. Vérifier le statut actuel du colis
        PackageStatus currentStatus = p.getStatus();
        if (currentStatus != PackageStatus.PREPARATION && currentStatus != PackageStatus.ASSIGNED) {
            throw new RuntimeException("Ce colis ne peut plus être annulé. Statut actuel : " + currentStatus);
        }

        // 4. Mettre à jour le statut
        p.setStatus(PackageStatus.CANCELLED);

        // Si le colis était assigné à un livreur, décrémenter sa charge de travail
        if (currentStatus == PackageStatus.ASSIGNED && p.getCourierId() != null) {
            decrementCourierLoad(p.getCourierId());
        }

        return repository.save(p);
    }
}


// =================================================================


class Courier {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String vehicleType;   // "moto" ou "voiture"
    private String deliveryZone;  // "Casablanca", "Rabat", etc.
    private Integer currentLoad;  // Nombre de colis actuels

    // Getters et Setters pour tous les champs
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getDeliveryZone() { return deliveryZone; }
    public void setDeliveryZone(String deliveryZone) { this.deliveryZone = deliveryZone; }
    public Integer getCurrentLoad() { return currentLoad; }
    public void setCurrentLoad(Integer currentLoad) { this.currentLoad = currentLoad; }
    // ... ajoutez les autres getters/setters si nécessaire
}

class UpdateStatusRequest {
    private String status;
    public UpdateStatusRequest(String status) { this.status = status; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}