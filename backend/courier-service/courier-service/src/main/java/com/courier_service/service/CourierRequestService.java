package com.courier_service.service;

import com.courier_service.model.CourierRequest;
import com.courier_service.repository.CourierRequestRepository;
import com.courier_service.dto.UpdateRoleRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;


import java.util.List;

@Service
public class CourierRequestService {

    private final CourierRequestRepository repository;



    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    public CourierRequestService(CourierRequestRepository repository) {
        this.repository = repository;
    }

    public CourierRequest save(CourierRequest req) {
        return repository.save(req);
    }

    public CourierRequest getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public List<CourierRequest> getPending() {
        return repository.findAll()
                .stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .toList();
    }

    // -------------------------
    // 🔥 APPEL INTERNE AUTH-SERVICE
    // -------------------------
    public void updateUserRole(String email, String role) {

        UpdateRoleRequest req = new UpdateRoleRequest();
        req.setEmail(email);
        req.setRole(role);


        HttpHeaders headers = new HttpHeaders();
        headers.add("X-INTERNAL-KEY", internalApiKey);

        HttpEntity<UpdateRoleRequest> entity = new HttpEntity<>(req, headers);

        restTemplate.postForEntity(
                authServiceUrl + "/internal/update-role",
                entity,
                Void.class
        );


    }
}
