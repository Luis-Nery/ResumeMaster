package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.AuthRequest;
import com.luisnery.resumemaster.dto.AuthResponse;
import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import com.luisnery.resumemaster.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for authentication operations.
 * Handles user registration and login, returning a JWT token on success.
 * All endpoints under {@code /api/auth} are publicly accessible (no token required).
 */
@Tag(name = "Authentication", description = "Register and log in to obtain a JWT token")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;


    public AuthController(JwtService jwtService, UserService userService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Registers a new user account and returns a JWT token.
     *
     * @param createUserRequest the registration payload containing email and password
     * @return a {@link AuthResponse} with a signed JWT token and the new user's ID
     */
    @Operation(summary = "Register a new user",
               description = "Creates a new user account and returns a signed JWT token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Registration successful, JWT token returned"),
        @ApiResponse(responseCode = "400", description = "Validation error or email already in use")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody CreateUserRequest createUserRequest) {
        User user = new User();
        user.setEmail(createUserRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(createUserRequest.getPassword()));
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(savedUser),savedUser.getId()));
    }

    /**
     * Authenticates an existing user and returns a JWT token.
     *
     * @param authRequest the login credentials (email and password)
     * @return a {@link AuthResponse} with a signed JWT token and the user's ID
     */
    @Operation(summary = "Log in",
               description = "Authenticates a user with email and password and returns a signed JWT token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful, JWT token returned"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                authRequest.getEmail(),
                authRequest.getPassword())
        );
        User user = (User) userDetailsService.loadUserByUsername(authRequest.getEmail());
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token,user.getId()));
    }
}
