package com.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI expenseTrackerAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Employee Expense Tracker API Documentation")
                        .description("Backend APIs for Employee Expense & Revenue Tracking System")
                        .version("1.0.0"));
    }
}
