package com.luisnery.resumemaster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.config.TestSecurityConfig;
import com.luisnery.resumemaster.dto.AuthRequest;
import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import com.luisnery.resumemaster.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link AuthController} using {@link WebMvcTest}.
 * The production JWT security filter chain is replaced with the permissive
 * {@link TestSecurityConfig} so that tests can focus on controller logic
 * rather than authentication.  All service dependencies are mocked via
 * {@code @MockitoBean}.
 */
@WebMvcTest(AuthController.class)
@Import(TestSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @Autowired
    private ObjectMapper objectMapper;

    private User fakeUser;

    @BeforeEach
    void setUp() {
        fakeUser = new User();
        fakeUser.setId(1L);
        fakeUser.setEmail("luis@test.com");
        fakeUser.setPasswordHash("hashed_password");
    }

    /**
     * Given a valid registration request with a proper email and password,
     * verifies the endpoint responds with 200 OK and a JSON body containing
     * an {@code authToken} and the new user's {@code userId}.
     */
    @Test
    void register_success_returnsTokenAndUserId() throws Exception {
        //Arrange
        CreateUserRequest request = new CreateUserRequest("luis@test.com", "password123");
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userService.createUser(any(User.class))).thenReturn(fakeUser);
        when(jwtService.generateToken(fakeUser)).thenReturn("mocked.jwt.token");
        //Act+Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authToken").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1L));
    }

    /**
     * Given a registration request with a malformed email (fails {@code @Email}
     * validation), verifies the endpoint responds with 400 Bad Request without
     * invoking any service.
     */
    @Test
    void register_invalidEmail_returnsBadRequest() throws Exception {
        //Arrange
        CreateUserRequest request = new CreateUserRequest("not-an-email", "password123");
        //Act+Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Given valid credentials for an existing user, verifies the endpoint
     * responds with 200 OK and a JSON body containing an {@code authToken}
     * and the user's {@code userId}.
     */
    @Test
    void login_success_returnsTokenAndUserId() throws Exception {
        //Arrange
        AuthRequest request = new AuthRequest("luis@test.com", "password123");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userDetailsServiceImpl.loadUserByUsername("luis@test.com")).thenReturn(fakeUser);
        when(jwtService.generateToken(fakeUser)).thenReturn("mocked.jwt.token");
        //Act+Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authToken").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1L));
    }

    /**
     * Given credentials that do not match any user, the {@link AuthenticationManager}
     * throws {@link BadCredentialsException}; verifies the endpoint responds with
     * 401 Unauthorized.
     */
    @Test
    void login_wrongCredentials_returnsUnauthorized() throws Exception {
        //Arrange
        AuthRequest request = new AuthRequest("luis@test.com", "wrongpassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        //Act+Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
