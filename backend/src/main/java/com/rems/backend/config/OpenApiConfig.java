package com.rems.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI remsOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("REMS API")
                .version("v1")
                .description("Commercial real estate management API for DIGT3101 Deliverable 3.")
                .contact(new Contact()
                    .name("REMS Project Team")
                    .email("admin@rems.com"))
                .license(new License()
                    .name("Course Project Use")));
    }
}
