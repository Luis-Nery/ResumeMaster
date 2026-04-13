package com.luisnery.resumemaster.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Test-only Spring Security configuration used by {@code @WebMvcTest} controller tests.
 * Disables CSRF protection and permits all HTTP requests so that controller tests
 * can focus on business logic without needing a valid JWT token.
 */
@TestConfiguration
public class TestSecurityConfig {
    /**
     * Builds a permissive {@link SecurityFilterChain} that allows all requests
     * without authentication, replacing the production JWT-based filter chain.
     *
     * @param http the {@link HttpSecurity} builder provided by Spring Security
     * @return the configured {@link SecurityFilterChain}
     * @throws Exception if the security configuration fails to build
     */
    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}