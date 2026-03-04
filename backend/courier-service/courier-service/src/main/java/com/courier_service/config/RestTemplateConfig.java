package com.courier_service.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        // REST TEMPLATE NORMAL (pas load-balanced)
        return new RestTemplate();
    }
}

