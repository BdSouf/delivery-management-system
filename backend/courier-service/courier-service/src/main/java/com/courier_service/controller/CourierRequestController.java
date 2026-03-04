package com.courier_service.controller;



import com.courier_service.model.CourierRequest;
import com.courier_service.service.CourierRequestService;
import com.courier_service.model.Courier;
import com.courier_service.service.CourierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/couriers")
public class CourierRequestController {

    private final CourierRequestService requestService;
    private final CourierService courierService;

    public CourierRequestController(CourierRequestService requestService,
                                    CourierService courierService) {
        this.requestService = requestService;
        this.courierService = courierService;
    }

    // 🔵 Livreurs : déposer la demande
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody CourierRequest req, Principal principal) {

        req.setEmail(principal.getName());
        req.setStatus("PENDING");

        return ResponseEntity.ok(requestService.save(req));
    }

    // 🟣 Admin : voir toutes les demandes
    @GetMapping("/admin/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CourierRequest> getPending() {
        return requestService.getPending();
    }

    // 🟢 Admin : approuver
    @PostMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id) {

        CourierRequest req = requestService.getById(id);

        // créer un vrai livreur actif
        Courier courier = new Courier();
        courier.setFullName(req.getFullName());
        courier.setEmail(req.getEmail());
        courier.setVehicleType(req.getVehicleType());
        courier.setPhone(req.getPhone());
        courier.setStatus("AVAILABLE");

        courierService.save(courier);

        // 🔥 APPEL AUTH-SERVICE → changer rôle
        requestService.updateUserRole(req.getEmail(), "ROLE_COURIER");

        req.setStatus("APPROVED");
        requestService.save(req);

        return ResponseEntity.ok("Courier approved successfully");
    }


    // 🔴 Admin : rejeter
    @PostMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        CourierRequest req = requestService.getById(id);
        req.setStatus("REJECTED");
        requestService.save(req);
        return ResponseEntity.ok("Courier request rejected successfully");
    }
}
