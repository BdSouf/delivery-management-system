package com.user_service.controller;

import com.user_service.dto.UserProfileCreationRequest;
import com.user_service.model.UserProfile;
import com.user_service.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserProfileService userProfileService;

    public InternalUserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }


    // Endpoint pour créer un profil utilisateur à partir d'une requête interne
    @PostMapping("/profile")
    public ResponseEntity<String> createUserProfile(@RequestBody UserProfileCreationRequest request) {
        try {
            UserProfile profile = new UserProfile();
            profile.setFirstName(request.getFirstName());
            profile.setLastName(request.getLastName());
            profile.setEmail(request.getEmail());
            profile.setRole(request.getRole() != null ? request.getRole() : "CLIENT"); // Rôle par défaut

            userProfileService.create(profile); // Utilise la méthode create existante

            return ResponseEntity.status(HttpStatus.CREATED).body("User profile created successfully");
        } catch (Exception e) {
            // Gérer le cas où l'email existe déjà
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists: " + e.getMessage());
        }
    }

    // Endpoint pour récupérer l'ID d'un utilisateur à partir de son email
    @GetMapping("/id-by-email/{email}")
    public ResponseEntity<Map<String, Long>> getUserIdByEmail(@PathVariable String email) {
        UserProfile user = userProfileService.findByEmail(email)
                .orElse(null); // Ne pas lever d'exception pour ne pas exposer l'existence

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Retourner l'ID dans un objet JSON pour plus de flexibilité
        return ResponseEntity.ok(Map.of("userId", user.getId()));
    }
}