package com.package_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // --- RÈGLE DE TEST EN PREMIER ---
                        .requestMatchers(HttpMethod.PUT, "/test/**").hasRole("COURIER")

                        // --- Endpoints PUBLICS ---
                        .requestMatchers("/api/packages/tracking/**").permitAll()

                        // --- Endpoints LIVREUR ---
                        // --- MODIFICATION ICI : Permettre l'accès, le contrôleur vérifiera ---
                        .requestMatchers(HttpMethod.PUT, "/api/packages/{id}/status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/packages/courier/assignments").hasRole("COURIER")
                        .requestMatchers(HttpMethod.GET, "/api/packages/debug/roles").hasRole("COURIER")

                        // --- Endpoints CLIENT ---
                        .requestMatchers(HttpMethod.POST, "/api/packages/create").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/packages/my").hasRole("CLIENT")
                        // AJOUT DE CETTE LIGNE pour autoriser les clients à annuler leurs colis
                        .requestMatchers(HttpMethod.PUT, "/api/packages/{id}/cancel").hasRole("CLIENT")

                        // --- Endpoints ADMIN ---
                        .requestMatchers("/api/packages/admin/**").hasRole("ADMIN")

                        // --- RÈGLE PAR DÉFAUT ---
                        .anyRequest().denyAll()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}