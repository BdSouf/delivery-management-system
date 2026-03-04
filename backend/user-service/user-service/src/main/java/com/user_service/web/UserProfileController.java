package com.user_service.web;



import com.user_service.model.UserProfile;
import com.user_service.repository.UserProfileRepository;
import com.user_service.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService service;
    private final UserProfileRepository profileRepository;

    public UserProfileController(UserProfileService service , UserProfileRepository profileRepository) {
        this.service = service;
        this.profileRepository = profileRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserProfile>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserProfile> create(@Valid @RequestBody UserProfile profile) {
        return ResponseEntity.ok(service.create(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> update(
            @PathVariable Long id,
            @Valid @RequestBody UserProfile profile) {
        return ResponseEntity.ok(service.update(id, profile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/public/create")
    public ResponseEntity<UserProfile> createPublic(@RequestBody UserProfile user) {
        return ResponseEntity.ok(service.create(user));
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<UserProfile> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(
                profileRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"))
        );
    }



    // Dans UserProfileController.java

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CLIENT', 'COURIER', 'ADMIN')")
    public ResponseEntity<UserProfile> getProfile(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(
                profileRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"))
        );
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('CLIENT', 'COURIER', 'ADMIN')")
    public ResponseEntity<UserProfile> updateProfile(
            @Valid @RequestBody UserProfile updatedProfile,
            Principal principal) {

        String email = principal.getName();
        UserProfile existingProfile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Mettre à jour les champs autorisés
        existingProfile.setFirstName(updatedProfile.getFirstName());
        existingProfile.setLastName(updatedProfile.getLastName());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setAddress(updatedProfile.getAddress());

        return ResponseEntity.ok(profileRepository.save(existingProfile));
    }

}
