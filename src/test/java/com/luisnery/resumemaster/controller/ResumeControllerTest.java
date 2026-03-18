package com.luisnery.resumemaster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.dto.CreateResumeRequest;

import com.luisnery.resumemaster.dto.ResumeResponse;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.exception.ResumeNotFoundException;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.model.User;

import com.luisnery.resumemaster.service.ResumeService;
import com.luisnery.resumemaster.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ResumeController.class)
public class ResumeControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserService userService;
    @MockitoBean
    private ResumeService resumeService;
    @Autowired
    private ObjectMapper objectMapper;
    private User fakeUser;
    private Resume fakeResume;
    private UserResponse fakeUserResponse;
    private ResumeResponse fakeResumeResponse;

    @BeforeEach
    void setUp() {
        fakeUser = new User();
        fakeUser.setId(1L);
        fakeUser.setEmail("luis@test.com");
        fakeUser.setFirstName("Luis");
        fakeUser.setLastName("Nery");
        fakeUser.setPasswordHash("password123");
        fakeResume = new Resume();
        fakeResume.setId(1L);
        fakeResume.setTitle("Mocked Resume");
        fakeResume.setContent("Mocked Content");
        fakeResume.setUser(fakeUser);
        fakeUserResponse = new UserResponse(1L, "Luis", "Nery",
                "luis@test.com", LocalDateTime.now());
        fakeResumeResponse = new ResumeResponse(1L, "Mocked Resume", "Mocked Content"
                , LocalDateTime.now(), LocalDateTime.now(), fakeUserResponse);
    }

    @Test
    void getAllResumesByUserId_returnsListOfResumeResponses() throws Exception {
        //Arrange
        when(resumeService.getAllByUserId(1L)).thenReturn(List.of(fakeResume));
        //Act+Assert
        mockMvc.perform(get("/api/resumes/user/1")).andExpect(status().isOk()).
                andExpect(jsonPath("$").isArray());
    }

    @Test
    void getAllResumesByUserId_returnsEmptyList() throws Exception {
        //Arrange
        when(resumeService.getAllByUserId(1L)).thenReturn(List.of());
        //Act+Assert
        mockMvc.perform(get("/api/resumes/user/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getResumeById_returnsResumeResponse() throws Exception {
        //Arrange
        when(resumeService.getById(1L)).thenReturn(fakeResume);
        //Act+Assert
        mockMvc.perform(get("/api/resumes/1")).andExpect(status().isOk()).
                andExpect(jsonPath("$.title").value("Mocked Resume"))
                .andExpect(jsonPath("$.content").value("Mocked Content"));
    }

    @Test
    void getResumeById_resumeNotFound_throwsException() throws Exception {
        //Arrange
        when(resumeService.getById(1L)).thenThrow(new ResumeNotFoundException(1L));
        //Act+Assert
        mockMvc.perform(get("/api/resumes/1")).andExpect(status().isNotFound());
    }

    @Test
    void createResume_success() throws Exception {
        //Arrange
        CreateResumeRequest resumeRequest = new CreateResumeRequest("Mocked Resume",
                "Mocked Content",
                1L);
        when(resumeService.createResume(any(Resume.class))).thenReturn(fakeResume);
        //Act+Assert
        mockMvc.perform(post("/api/resumes").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resumeRequest)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.title").value("Mocked Resume"));
    }
    @Test
    void createResume_invalidData_returnsBadRequest() throws Exception {
        //Arrange
        CreateResumeRequest resumeRequest = new CreateResumeRequest("",
                "Mocked Content",
                1L);
        //Act+Assert
        mockMvc.perform(post("/api/resumes").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resumeRequest)))
                .andExpect(status().isBadRequest());
    }
    @Test
    void  deleteResume_success() throws Exception {
        //Arrange
        doNothing().when(resumeService).deleteResume(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/resumes/1")).andExpect(status().isNoContent());
    }
    @Test
    void deleteResume_resumeNotFound_throwsException() throws Exception {
        //Arrange
        doThrow(new ResumeNotFoundException(1L)).when(resumeService).deleteResume(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/resumes/1")).andExpect(status().isNotFound());
    }

}
