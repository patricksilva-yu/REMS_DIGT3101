package com.rems.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RemsApplication {

    public static void main(String[] args) {
        SpringApplication.run(RemsApplication.class, args);
    }
}
