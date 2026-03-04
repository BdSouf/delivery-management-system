package com.courier_service.dto;



import lombok.Data;

@Data
public class UpdateRoleRequest {
    private String email;
    private String role;
}

