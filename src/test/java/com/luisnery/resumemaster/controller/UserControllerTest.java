package com.luisnery.resumemaster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.config.TestSecurityConfig;
import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.exception.UserNotFoundException;
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

@WebMvcTest(UserController.class)
@Import(TestSecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

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

        fakeUserResponse = new UserResponse(1L, "Luis", "Nery", "luis@test.com", LocalDateTime.now());
    }

    @Test
    void getAllUsers_returnsListOfUsers() throws Exception {
        //Arrange
        when(userService.getAllUsers()).thenReturn(List.of(fakeUser));
        //Act+Assert
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).andExpect(jsonPath("$")
                .isArray()).andExpect(jsonPath("$[0].email").value("luis@test.com"));
    }

    @Test
    void getAllUsers_returnsEmptyList() throws Exception {
        //Arrange
        when(userService.getAllUsers()).thenReturn(List.of());
        //Act+Assert
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).
                andExpect(jsonPath("$").isArray()).
                andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getUserById_userExists_returnsUser() throws Exception {
        //Arrange
        when(userService.getUserById(1L)).thenReturn(fakeUser);
        //Act+ Assert
        mockMvc.perform(get("/api/users/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("luis@test.com"))
                .andExpect(jsonPath("$.firstName").value("Luis"));
    }

    @Test
    void getUserById_userNotFound_throwsException() throws Exception {
        //Arrange
        when(userService.getUserById(99L)).thenThrow(new UserNotFoundException(99L));
        //Act+Assert
        mockMvc.perform(get("/api/users/99")).andExpect(status().isNotFound());
    }

    @Test
    void createUser_success_returnsCreatedUser() throws Exception {
        //Arrange
        CreateUserRequest request = new CreateUserRequest
                ("luis@test.com",
                        "password123",
                        "Luis",
                        "Nery");
        when(userService.createUser(any(User.class))).thenReturn(fakeUser);
        //Act+Assert
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))).andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("luis@test.com"));
    }

    @Test
    void createUser_invalidData_returnsBadRequest() throws Exception {
        //Arrange
        CreateUserRequest request = new CreateUserRequest
                ("",
                        "password123",
                        "Luis",
                        "Nery");
        //Act + Assert
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

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

    @Test
    void deleteUserById_success() throws Exception {
        //Arrange
        doNothing().when(userService).deleteUser(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isNoContent());
    }

    @Test
    void deleteUserById_userNotFound_throwsException() throws Exception {
        //Arrange
        doThrow(new UserNotFoundException(1L)).when(userService).deleteUser(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isNotFound());
    }
}