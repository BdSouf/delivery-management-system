package com.courier_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // 1. Injectez LES DEUX filtres
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final InternalApiKeyFilter internalApiKeyFilter;

    // 2. Mettez à jour le constructeur
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, InternalApiKeyFilter internalApiKeyFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.internalApiKeyFilter = internalApiKeyFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/eureka/**").permitAll()

                        // NOUVEAU : Autoriser tous les endpoints internes pour la communication inter-services
                        .requestMatchers("/internal/**").permitAll()

                        // AJOUT DES RÈGLES MANQUANTES
                        .requestMatchers("/api/couriers/all").permitAll() // <-- AJOUT 1
                        .requestMatchers("/api/couriers/*/load").permitAll() // <-- AJOUT 2

                        // Gardez les autres règles existantes
                        .requestMatchers("/api/couriers/available").permitAll()
                        .requestMatchers("/api/couriers/*/status").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 4. AJOUT CRUCIAL : Ajoutez le filtre interne AVANT le filtre JWT
                .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}