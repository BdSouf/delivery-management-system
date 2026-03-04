package com.courier_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class CourierServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CourierServiceApplication.class, args);
	}


}
