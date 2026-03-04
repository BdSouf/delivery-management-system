package com.courier_service.controller;

import com.courier_service.service.CourierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/couriers")
public class InternalCourierController {

    private final CourierService courierService;

    public InternalCourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    /**
     * Endpoint interne pour récupérer l'ID d'un livreur à partir de son email.
     * Sera appelé par le package-service.
     */
    @GetMapping("/id-by-email/{email}")
    public ResponseEntity<Map<String, Long>> getCourierIdByEmail(@PathVariable String email) {
        Long courierId = courierService.getCourierIdByEmail(email);

        if (courierId == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of("courierId", courierId));
    }
}