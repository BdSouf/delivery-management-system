    package com.courier_service.repository;



    import com.courier_service.model.CourierRequest;
    import org.springframework.data.jpa.repository.JpaRepository;

    public interface CourierRequestRepository extends JpaRepository<CourierRequest, Long> {
    }
