package com.package_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {

    @PutMapping("/update-status/{id}")
    public ResponseEntity<String> testUpdateStatus(@PathVariable Long id) {
        return ResponseEntity.ok("Test endpoint reached for package ID: " + id + ". User: " + SecurityContextHolder.getContext().getAuthentication().getName());
    }
}