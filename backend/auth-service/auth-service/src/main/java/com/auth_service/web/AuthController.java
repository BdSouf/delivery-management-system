package com.auth_service.web;

import com.auth_service.web.dto.AuthResponse;
import com.auth_service.web.dto.LoginRequest;
import com.auth_service.web.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {

        //  impossible de créer un ADMIN via API publique
        if (request.getRole().equalsIgnoreCase("ADMIN")) {
            throw new RuntimeException("Admin accounts cannot be created through public API.");
        }

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<String> me() {
        return ResponseEntity.ok("Token valide");
    }
}
