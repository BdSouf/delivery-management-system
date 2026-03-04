package com.courier_service.model;



import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "courier_requests")
public class CourierRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private String cinNumber;
    private String vehicleType;

    private String status;  // PENDING, APPROVED, REJECTED
}

