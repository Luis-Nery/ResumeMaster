package com.luisnery.resumemaster.config;

import com.luisnery.resumemaster.security.JwtAuthFilter;
import com.luisnery.resumemaster.security.OAuth2ModePreservingRepository;
import com.luisnery.resumemaster.security.OAuth2ModeRequestResolver;
import com.luisnery.resumemaster.security.OAuth2SuccessHandler;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security configuration for the application.
 * Sets up stateless JWT-based authentication, CORS, and the public/protected route split.
 * Public routes: {@code /api/auth/**}, OAuth2 endpoints, and Swagger UI paths.
 * All other routes require a valid Bearer token.
 * Sessions are created only when needed (OAuth2 authorization code flow requires a
 * short-lived session to store the CSRF state; API requests remain stateless via JWT).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final OAuth2SuccessHandler oauth2SuccessHandler;
    private final OAuth2ModeRequestResolver oauth2ModeRequestResolver;
    private final OAuth2ModePreservingRepository oauth2ModePreservingRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          UserDetailsServiceImpl userDetailsService,
                          OAuth2SuccessHandler oauth2SuccessHandler,
                          OAuth2ModeRequestResolver oauth2ModeRequestResolver,
                          OAuth2ModePreservingRepository oauth2ModePreservingRepository,
                          PasswordEncoder passwordEncoder) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.oauth2ModeRequestResolver = oauth2ModeRequestResolver;
        this.oauth2ModePreservingRepository = oauth2ModePreservingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        // IF_REQUIRED allows the OAuth2 flow to create a short-lived session
                        // for the authorization code state; API calls remain stateless via JWT.
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .exceptionHandling(ex -> ex
                        // Prevent oauth2Login's default redirect-to-Google behavior for API requests.
                        // Without this, unauthenticated /api/** calls get a 302 instead of 401.
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(ae -> ae
                                .authorizationRequestResolver(oauth2ModeRequestResolver)
                                .authorizationRequestRepository(oauth2ModePreservingRepository)
                        )
                        .successHandler(oauth2SuccessHandler)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(passwordEncoder);
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}