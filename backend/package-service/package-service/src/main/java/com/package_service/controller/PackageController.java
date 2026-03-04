package com.package_service.controller;

import com.package_service.model.Package;
import com.package_service.model.PackageStatus;
import com.package_service.service.PackageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.package_service.dto.UpdateStatusRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    private final PackageService service;

    public PackageController(PackageService service) {
        this.service = service;
    }

    // 🟢 CLIENT — créer un colis
    @PostMapping("/create")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> create(@RequestBody Package p, Principal principal) { // Déjà correct avec <?>
        String email = principal.getName();
        Long clientId = service.getClientIdFromEmail(email);

        if (clientId == null) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé dans le service utilisateur.");
        }

        p.setClientId(clientId);
        return ResponseEntity.ok(service.create(p));
    }

    // 🟡 CLIENT — voir ses colis
    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Package>> getMyPackages(Principal principal) {
        String userEmail = principal.getName();
        Long clientId = service.getClientIdFromEmail(userEmail);

        if (clientId == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(service.getClientPackages(clientId));
    }

    // 🔵 PUBLIC — suivre un colis par numéro de tracking
    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<Package> trackPackage(@PathVariable String trackingNumber) {
        try {
            Package p = service.getByTrackingNumber(trackingNumber);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🟣 LIVREUR — voir les colis qui lui sont assignés
    @GetMapping("/courier/assignments")
    @PreAuthorize("hasRole('COURIER')")
    public List<Package> getCourierAssignments(Principal principal) {
        String courierEmail = principal.getName();
        return service.getCourierAssignments(courierEmail);
    }

    // 🟣 LIVREUR — mettre à jour le statut d'un colis (VERSION DE DÉBOGAGE)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePackageStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Principal principal) {

        // --- DÉBOGAGE : Vérification manuelle du rôle ---
        boolean hasCourierRole = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_COURIER"));

        if (!hasCourierRole) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: User does not have the ROLE_COURIER.");
        }
        // -------------------------------------------------------

        try {
            Package updatedPackage = service.updateStatus(id, PackageStatus.valueOf(request.getStatus()), principal);
            return ResponseEntity.ok(updatedPackage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }


    // 🔵 ADMIN — voir tous les colis
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Package> getAllPackages() {
        return service.getAllPackages();
    }

    // 🔵 ADMIN — Lancer le dispatching du prochain colis
    @PostMapping("/admin/dispatch-next")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> dispatchNextPackage() { // Déjà correct avec <?>
        try {
            Package dispatchedPackage = service.dispatchNextPackage();
            return ResponseEntity.ok(dispatchedPackage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(503).body(e.getMessage());
        }
    }





    @GetMapping("/debug/roles")
    public ResponseEntity<Map<String, Object>> debugRoles(Principal principal) {
        Map<String, Object> details = new HashMap<>();
        details.put("name", principal.getName());
        details.put("authorities", SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        return ResponseEntity.ok(details);
    }
//...

    // 🔴 CLIENT — annuler son colis
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> cancelPackage(@PathVariable Long id, Principal principal) {
        try {
            String clientEmail = principal.getName();
            Package cancelledPackage = service.cancelPackage(id, clientEmail);
            return ResponseEntity.ok(cancelledPackage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }









}