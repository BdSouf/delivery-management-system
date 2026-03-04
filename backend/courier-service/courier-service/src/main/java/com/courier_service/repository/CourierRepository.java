package com.courier_service.repository;



import com.courier_service.model.Courier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourierRepository extends JpaRepository<Courier, Long> {
    List<Courier> findByStatus(String status);
    Optional<Courier> findByEmail(String email);


}
