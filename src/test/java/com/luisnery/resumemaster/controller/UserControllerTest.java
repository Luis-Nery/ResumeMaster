package com.luisnery.resumemaster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.config.TestSecurityConfig;
import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import com.luisnery.resumemaster.service.UserService;
import com.luisnery.resumemaster.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link UserController} using {@link WebMvcTest}.
 * The production JWT security filter chain is replaced with the permissive
 * {@link TestSecurityConfig} so that tests can focus on controller logic
 * rather than authentication.  All service dependencies are mocked via
 * {@code @MockitoBean}.
 */
@WebMvcTest(UserController.class)
@Import(TestSecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @Autowired
    private ObjectMapper objectMapper;

    private User fakeUser;
    private UserResponse fakeUserResponse;

    @BeforeEach
    void setUp() {
        fakeUser = new User();
        fakeUser.setId(1L);
        fakeUser.setEmail("luis@test.com");
        fakeUser.setFirstName("Luis");
        fakeUser.setLastName("Nery");
        fakeUser.setPasswordHash("password123");

        fakeUserResponse = new UserResponse(1L, "Luis", "Nery", "luis@test.com", LocalDateTime.now(), null);
    }

    /**
     * Given the service returns a non-empty list, verifies the endpoint responds
     * with 200 OK, a JSON array, and the correct email in the first element.
     */
    @Test
    void getAllUsers_returnsListOfUsers() throws Exception {
        //Arrange
        when(userService.getAllUsers()).thenReturn(List.of(fakeUser));
        //Act+Assert
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).andExpect(jsonPath("$")
                .isArray()).andExpect(jsonPath("$[0].email").value("luis@test.com"));
    }

    /**
     * Given the service returns an empty list, verifies the endpoint responds
     * with 200 OK and an empty JSON array.
     */
    @Test
    void getAllUsers_returnsEmptyList() throws Exception {
        //Arrange
        when(userService.getAllUsers()).thenReturn(List.of());
        //Act+Assert
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).
                andExpect(jsonPath("$").isArray()).
                andExpect(jsonPath("$").isEmpty());
    }

    /**
     * Given the service returns a user for the requested ID, verifies the endpoint
     * responds with 200 OK and the correct email and firstName fields.
     */
    @Test
    void getUserById_userExists_returnsUser() throws Exception {
        //Arrange
        when(userService.getUserById(1L)).thenReturn(fakeUser);
        //Act+ Assert
        mockMvc.perform(get("/api/users/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("luis@test.com"))
                .andExpect(jsonPath("$.firstName").value("Luis"));
    }

    /**
     * Given the service throws {@link UserNotFoundException} for an unknown ID,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void getUserById_userNotFound_throwsException() throws Exception {
        //Arrange
        when(userService.getUserById(99L)).thenThrow(new UserNotFoundException(99L));
        //Act+Assert
        mockMvc.perform(get("/api/users/99")).andExpect(status().isNotFound());
    }

    /**
     * Given a valid update request and the service returns the updated user,
     * verifies the endpoint responds with 200 OK.
     */
    @Test
    void updateUser_success_returnsUpdatedUser() throws Exception {
        //Arrange
        UpdateUserRequest updateUserRequest = new UpdateUserRequest
                (null, null, "Updated", null);
        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(fakeUser);
        //Act+Assert
        mockMvc.perform(put("/api/users/1").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isOk());
    }

    /**
     * Given the service throws {@link UserNotFoundException} during an update,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void updateUser_userNotFound_throwsException() throws Exception {
        //Arrange
        UpdateUserRequest updateUserRequest = new UpdateUserRequest
                (null, null, "Updated", null);
        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenThrow(new UserNotFoundException(1L));
        //Act+Assert
        mockMvc.perform(put("/api/users/1").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isNotFound());
    }

    /**
     * Given the service deletes the user without error, verifies the endpoint
     * responds with 204 No Content.
     */
    @Test
    void deleteUserById_success() throws Exception {
        //Arrange
        doNothing().when(userService).deleteUser(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isNoContent());
    }

    /**
     * Given the service throws {@link UserNotFoundException} during deletion,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void deleteUserById_userNotFound_throwsException() throws Exception {
        //Arrange
        doThrow(new UserNotFoundException(1L)).when(userService).deleteUser(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isNotFound());
    }
}