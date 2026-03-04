//package com.auth_service.web;
//
//import com.auth_service.user.User;
//import com.auth_service.user.UserRepository;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/internal/users")
//public class InternalUserDetailsController {
//
//    private final UserRepository userRepository;
//
//    public InternalUserDetailsController(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//
//    @GetMapping("/details/{email}")
//    public ResponseEntity<?> getUserDetails(@PathVariable String email) {
//        // La sécurité est gérée par InternalApiKeyFilter au niveau global
//        return userRepository.findByEmail(email)
//                .map(user -> ResponseEntity.ok(Map.of(
//                        "email", user.getEmail(),
//                        "role", user.getRole()
//                        // Vous pouvez ajouter d'autres infos si nécessaire
//                )))
//                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
//                        .body(Map.of("error", "User not found in auth-service")));
//    }
//}