package com.courier_service.dto;



import lombok.Data;

@Data
public class CourierApplyRequest {

    private String fullName;
    private String phone;
    private String cinNumber;
    private String vehicleType;
}

