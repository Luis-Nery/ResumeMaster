package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.AuthRequest;
import com.luisnery.resumemaster.dto.AuthResponse;
import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import com.luisnery.resumemaster.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody CreateUserRequest createUserRequest) {
        User user = new User();
        user.setEmail(createUserRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(createUserRequest.getPassword()));
        User savedUser = userService.createUser(user);
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(savedUser),savedUser.getId()));
    }

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
