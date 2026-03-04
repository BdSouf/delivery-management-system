package com.package_service.security;



import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public Claims extractAll(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRole(String token) {
        return extractAll(token).get("role", String.class);
    }

    public String extractEmail(String token) {
        return extractAll(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            extractAll(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
