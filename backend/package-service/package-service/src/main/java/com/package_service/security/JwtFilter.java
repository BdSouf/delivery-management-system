package com.package_service.security;

import com.package_service.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {

            String token = auth.substring(7);

            if (jwtService.isValid(token)) {

                String email = jwtService.extractEmail(token);
                String role = jwtService.extractRole(token);

                // --- LOGIQUE DE NORMALISATION DU RÔLE ---
                String normalizedRole = null;
                if (role != null) {
                    role = role.replace("[", "").replace("]", "");
                    role = role.toUpperCase();
                    if (!role.startsWith("ROLE_")) {
                        normalizedRole = "ROLE_" + role;
                    } else {
                        normalizedRole = role;
                    }
                }
                // ------------------------------------------

                var authorities = List.of(new SimpleGrantedAuthority(normalizedRole));

                var authToken = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(request, response);
    }
}