package com.courier_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // CETTE ANNOTATION EST OBLIGATOIRE
public class InternalApiKeyFilter extends OncePerRequestFilter {

    private static final String INTERNAL_KEY = "SECRET123456";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Vérifier uniquement les routes internes
        if (request.getRequestURI().startsWith("/api/couriers/available") || request.getRequestURI().contains("/status")) {
            String key = request.getHeader("X-INTERNAL-KEY");

            if (!INTERNAL_KEY.equals(key)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}