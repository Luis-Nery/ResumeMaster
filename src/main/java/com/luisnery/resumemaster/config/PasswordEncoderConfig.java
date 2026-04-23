package com.luisnery.resumemaster.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Defines the {@link PasswordEncoder} bean in its own configuration class so that
 * it can be injected into both {@link SecurityConfig} and {@link com.luisnery.resumemaster.service.UserService}
 * without creating a circular dependency.
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * Provides a BCrypt password encoder for hashing and verifying passwords.
     *
     * @return a {@link BCryptPasswordEncoder} instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}