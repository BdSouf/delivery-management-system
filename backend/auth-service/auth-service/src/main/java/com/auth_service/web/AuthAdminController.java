package com.auth_service.web;



import com.auth_service.user.User;
import com.auth_service.user.UserRepository;
import com.auth_service.web.dto.UpdateRoleRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
public class AuthAdminController {

    private final UserRepository userRepository;

    public AuthAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/update-role")
    public void updateRole(@RequestBody UpdateRoleRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(request.getRole());
        userRepository.save(user);
    }
}
