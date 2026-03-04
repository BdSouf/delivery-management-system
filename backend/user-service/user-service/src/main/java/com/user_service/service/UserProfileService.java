package com.user_service.service;



import com.user_service.model.UserProfile;
import com.user_service.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserProfileService {

    private final UserProfileRepository repo;

    public UserProfileService(UserProfileRepository repo) {
        this.repo = repo;
    }



    // Ajoutez cette méthode
    public Optional<UserProfile> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<UserProfile> findAll() {
        return repo.findAll();
    }

    public UserProfile findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("UserProfile not found"));
    }

    public UserProfile create(UserProfile profile) {
        if (repo.existsByEmail(profile.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return repo.save(profile);
    }

    public UserProfile update(Long id, UserProfile updated) {
        UserProfile existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setRole(updated.getRole());
        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }



}

