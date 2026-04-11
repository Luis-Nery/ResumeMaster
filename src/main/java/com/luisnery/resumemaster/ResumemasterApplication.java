package com.luisnery.resumemaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the ResumeMaster Spring Boot application.
 */
@SpringBootApplication
public class ResumemasterApplication {

    /**
     * Bootstraps the Spring application context.
     *
     * @param args command-line arguments passed to the application
     */
    public static void main(String[] args) {
        SpringApplication.run(ResumemasterApplication.class, args);
    }

}
