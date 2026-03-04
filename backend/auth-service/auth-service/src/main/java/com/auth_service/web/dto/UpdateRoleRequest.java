package com.auth_service.web.dto;



import lombok.Data;

@Data
public class UpdateRoleRequest {
    private String email;
    private String role;
}
