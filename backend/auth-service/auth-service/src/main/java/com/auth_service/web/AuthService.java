package com.auth_service.web;

import com.auth_service.jwt.JwtService;
import com.auth_service.user.User;
import com.auth_service.user.UserRepository;
import com.auth_service.web.dto.AuthResponse;
import com.auth_service.web.dto.LoginRequest;
import com.auth_service.web.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    // NOUVEAU : Injection des dépendances pour l'appel inter-service
    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;


    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        // transformer "COURIER" → "COURIER_PENDING"
        String role;
        if (request.getRole().equalsIgnoreCase("COURIER")) {
            role = "ROLE_COURIER_PENDING";
        } else {
            role = "ROLE_CLIENT";
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        // 1. On sauvegarde l'utilisateur dans la base de données auth-service
        userRepository.save(user);

        // 2. NOUVEAU : On appelle user-service pour créer le profil correspondant
        try {
            // L'URL de l'endpoint interne du user-service
            String profileCreationUrl = userServiceUrl + "/internal/users/profile";

            // On crée le corps de la requête avec les infos nécessaires
            UserProfileCreationRequest profileRequest = new UserProfileCreationRequest();
            profileRequest.setFirstName(request.getFirstName());
            profileRequest.setLastName(request.getLastName());
            profileRequest.setEmail(request.getEmail());
            profileRequest.setRole(role);

            // On prépare les en-têtes avec la clé secrète pour l'authentification interne
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-KEY", "SECRET123456");

            // On crée l'entité de la requête (corps + en-têtes)
            HttpEntity<UserProfileCreationRequest> requestEntity = new HttpEntity<>(profileRequest, headers);

            // On fait l'appel POST à user-service
            ResponseEntity<String> response = restTemplate.postForEntity(profileCreationUrl, requestEntity, String.class);

            // On peut vérifier la réponse si nécessaire
            if (!response.getStatusCode().is2xxSuccessful()) {
                // Loguer une erreur, mais l'utilisateur dans auth-service est déjà créé.
                // C'est un état inconsistant. Pour l'instant, on continue.
                System.err.println("Failed to create user profile in user-service. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            // Gérer l'erreur si user-service est indisponible
            System.err.println("Failed to call user-service: " + e.getMessage());
            // Idéalement, il faudrait implémenter un mécanisme de retry ou une compensation.
            // Pour l'instant, on logue l'erreur et on continue.
        }

        // 3. On génère le token JWT et on le retourne
        String token = jwtService.generateToken(user.getUsername(), role);
        return new AuthResponse(token, role);
    }

    public AuthResponse login(LoginRequest request) {
        var authToken = new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword());
        authManager.authenticate(authToken);

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getRole());
    }
}

// DTO interne pour la communication avec user-service
class UserProfileCreationRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String role;

    // Getters et Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}