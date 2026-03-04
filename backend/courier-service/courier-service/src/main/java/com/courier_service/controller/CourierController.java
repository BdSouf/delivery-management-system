package com.courier_service.controller;



import com.courier_service.dto.UpdateStatusRequest;
import com.courier_service.model.Courier;
import com.courier_service.service.CourierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/couriers")
public class CourierController {

    private final CourierService service;

    public CourierController(CourierService service) {
        this.service = service;
    }

    @PostMapping
    public Courier create(@RequestBody Courier c) {
        return service.save(c);
    }

    @GetMapping
    public List<Courier> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Courier getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public Courier update(@PathVariable Long id, @RequestBody Courier c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/available")
    public List<Courier> getAvailableCouriers() {
        return service.findAvailableCouriers();
    }

    @PutMapping("/{courierId}/status")
    public Courier updateCourierStatus(
            @PathVariable Long courierId,
            @RequestBody UpdateStatusRequest request) {
        return service.updateStatus(courierId, request.getStatus());
    }

    @GetMapping("/all")
    public List<Courier> getAllActiveCouriers() {
        return service.findAllActiveCouriers();
    }



    // Ajoutez cet endpoint
    @PutMapping("/{courierId}/load")
    public ResponseEntity<Void> updateCourierLoad(
            @PathVariable Long courierId,
            @RequestBody Map<String, Integer> loadRequest) {
        try {
            service.updateLoad(courierId, loadRequest.get("load"));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
