package com.luisnery.resumemaster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.config.TestSecurityConfig;
import com.luisnery.resumemaster.dto.CreateResumeRequest;

import com.luisnery.resumemaster.dto.ResumeResponse;
import com.luisnery.resumemaster.dto.UpdateResumeRequest;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.exception.ResumeNotFoundException;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.model.User;

import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.ResumeService;
import com.luisnery.resumemaster.service.UserDetailsServiceImpl;
import com.luisnery.resumemaster.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
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

/**
 * Integration tests for {@link ResumeController} using {@link WebMvcTest}.
 * The production JWT security filter chain is replaced with the permissive
 * {@link TestSecurityConfig} so that tests can focus on controller logic
 * rather than authentication.  All service dependencies are mocked via
 * {@code @MockitoBean}.
 */
@WebMvcTest(ResumeController.class)
@Import(TestSecurityConfig.class)
public class ResumeControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserService userService;
    @MockitoBean
    private ResumeService resumeService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

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
                "luis@test.com", LocalDateTime.now(), null);
        fakeResumeResponse = new ResumeResponse(1L, "Mocked Resume", "Mocked Content"
                , LocalDateTime.now(), LocalDateTime.now(), fakeUserResponse,false,1);
    }

    /**
     * Given the service returns a non-empty list of resumes for a user ID,
     * verifies the endpoint responds with 200 OK and a JSON array.
     */
    @Test
    void getAllResumesByUserId_returnsListOfResumeResponses() throws Exception {
        //Arrange
        when(resumeService.getAllByUserId(1L)).thenReturn(List.of(fakeResume));
        //Act+Assert
        mockMvc.perform(get("/api/resumes/user/1")).andExpect(status().isOk()).
                andExpect(jsonPath("$").isArray());
    }

    /**
     * Given the service returns an empty list for a user ID, verifies the
     * endpoint responds with 200 OK and an empty JSON array.
     */
    @Test
    void getAllResumesByUserId_returnsEmptyList() throws Exception {
        //Arrange
        when(resumeService.getAllByUserId(1L)).thenReturn(List.of());
        //Act+Assert
        mockMvc.perform(get("/api/resumes/user/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    /**
     * Given the service returns a resume for the requested ID, verifies the
     * endpoint responds with 200 OK and the correct title and content fields.
     */
    @Test
    void getResumeById_returnsResumeResponse() throws Exception {
        //Arrange
        when(resumeService.getById(1L)).thenReturn(fakeResume);
        //Act+Assert
        mockMvc.perform(get("/api/resumes/1")).andExpect(status().isOk()).
                andExpect(jsonPath("$.title").value("Mocked Resume"))
                .andExpect(jsonPath("$.content").value("Mocked Content"));
    }

    /**
     * Given the service throws {@link ResumeNotFoundException} for an unknown ID,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void getResumeById_resumeNotFound_throwsException() throws Exception {
        //Arrange
        when(resumeService.getById(1L)).thenThrow(new ResumeNotFoundException(1L));
        //Act+Assert
        mockMvc.perform(get("/api/resumes/1")).andExpect(status().isNotFound());
    }

    /**
     * Given a valid create request and the service persists the resume, verifies
     * the endpoint responds with 201 Created and the correct title in the response body.
     */
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

    /**
     * Given a create request with a blank title, which fails {@code @NotBlank} validation,
     * verifies the endpoint responds with 400 Bad Request.
     */
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

    /**
     * Given a valid update request and the service returns the updated resume,
     * verifies the endpoint responds with 200 OK.
     */
    @Test
    void updateResume_success() throws Exception {
        //Arrange
        UpdateResumeRequest resumeRequest = new UpdateResumeRequest(null, "Updated",null,null);
        when(resumeService.updateResume(eq(1L), any(UpdateResumeRequest.class))).thenReturn(fakeResume);
        //Act+Assert
        mockMvc.perform(put("/api/resumes/1").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resumeRequest))).andExpect(status().isOk());
    }

    /**
     * Given the service throws {@link ResumeNotFoundException} during an update,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void updateResume_resumeNotFound_throwsException() throws Exception {
        //Arrange
        UpdateResumeRequest resumeRequest = new UpdateResumeRequest(null, "Updated",null,null);
        when(resumeService.updateResume(eq(1L), any(UpdateResumeRequest.class)))
                .thenThrow(new ResumeNotFoundException(1L));
        //Act+Assert
        mockMvc.perform(put("/api/resumes/1").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resumeRequest))).andExpect(status().isNotFound());
    }

    /**
     * Given the service deletes the resume without error, verifies the endpoint
     * responds with 204 No Content.
     */
    @Test
    void deleteResume_success() throws Exception {
        //Arrange
        doNothing().when(resumeService).deleteResume(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/resumes/1")).andExpect(status().isNoContent());
    }

    /**
     * Given the service throws {@link ResumeNotFoundException} during deletion,
     * verifies the endpoint responds with 404 Not Found.
     */
    @Test
    void deleteResume_resumeNotFound_throwsException() throws Exception {
        //Arrange
        doThrow(new ResumeNotFoundException(1L)).when(resumeService).deleteResume(1L);
        //Act+Assert
        mockMvc.perform(delete("/api/resumes/1")).andExpect(status().isNotFound());
    }

}
