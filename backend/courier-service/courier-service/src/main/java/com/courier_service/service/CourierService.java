package com.courier_service.service;

import com.courier_service.model.Courier;
import com.courier_service.repository.CourierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourierService {

    private final CourierRepository repo;

    public CourierService(CourierRepository repo) {
        this.repo = repo;
    }

    public Courier save(Courier c) {
        return repo.save(c);
    }

    public List<Courier> findAll() {
        return repo.findAll();
    }

    public Courier findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Courier update(Long id, Courier c) {
        Courier old = findById(id);
        if (old == null) return null;

        old.setFullName(c.getFullName());
        old.setPhone(c.getPhone());
        old.setEmail(c.getEmail());
        old.setVehicleType(c.getVehicleType());
        old.setStatus(c.getStatus());

        return repo.save(old);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }


    public List<Courier> findAvailableCouriers() {
        return repo.findByStatus("AVAILABLE");
    }

    // Ajoutez cette méthode à votre service
    public List<Courier> findAllActiveCouriers() {
        return repo.findByStatus("AVAILABLE"); // On ne considère que les livreurs marqués comme actifs
    }




    /**
     * Met à jour le statut d'un livreur.
     */
    public Courier updateStatus(Long courierId, String newStatus) {
        Courier courier = repo.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Livreur non trouvé avec l'id: " + courierId));

        courier.setStatus(newStatus);
        return repo.save(courier);
    }

    public Long getCourierIdByEmail(String email) {
        return repo.findByEmail(email)
                .map(Courier::getId)
                .orElse(null);
    }


    // Ajoutez cette méthode
    public void updateLoad(Long courierId, int newLoad) {
        Courier courier = repo.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Livreur non trouvé avec l'id: " + courierId));
        courier.setCurrentLoad(newLoad);
        repo.save(courier);
    }
}
