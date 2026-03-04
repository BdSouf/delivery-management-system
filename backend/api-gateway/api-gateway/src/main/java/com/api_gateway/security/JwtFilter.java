package com.api_gateway.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class JwtFilter implements WebFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();

        // Autoriser AUTH-SERVICE sans vérifier le JWT
        if (request.getURI().getPath().startsWith("/api/auth")) {
            return chain.filter(exchange);
        }

        // Vérifier si un token existe
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // ⚠ IMPORTANT : Si pas de token → laisser SecurityConfig bloquer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        String token = authHeader.substring(7);

        // Si token invalide → laisser SecurityConfig bloquer
        try {
            jwtUtil.isTokenValid(token);
        } catch (Exception e) {
            return chain.filter(exchange);
        }

        // Continuer normalement
        return chain.filter(exchange);
    }
}
