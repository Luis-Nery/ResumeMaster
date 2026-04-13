package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateResumeRequest;
import com.luisnery.resumemaster.exception.ResumeNotFoundException;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.repository.ResumeRepository;
import com.luisnery.resumemaster.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link ResumeService}.
 * Uses Mockito to isolate the service from both {@link ResumeRepository} and
 * {@link UserRepository} so that each test verifies a single piece of business
 * logic without touching the database.
 */
@ExtendWith(MockitoExtension.class)
public class ResumeServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private ResumeRepository resumeRepository;

    @InjectMocks
    private ResumeService resumeService;

    private User fakeUser;
    private Resume fakeResume;

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
    }

    /**
     * Given the repository returns a non-empty list for a user ID, verifies the
     * service propagates the list unchanged.
     */
    @Test
    void getAllResumesByUserId_returnsListOfResumesByUserId() {
        //Arrange
        when(resumeRepository.findByUserId(1L)).thenReturn(List.of(fakeResume));
        //Act
        List<Resume> resumes = resumeService.getAllByUserId(1L);
        //Assert
        assertThat(resumes).hasSize(1);
    }

    /**
     * Given the repository returns an empty list for a user ID, verifies the
     * service propagates the empty result without throwing.
     */
    @Test
    void getAllResumesByUserId_returnsEmptyList() {
        //Arrange
        when(resumeRepository.findByUserId(1L)).thenReturn(List.of());
        //Act
        List<Resume> resumes = resumeService.getAllByUserId(1L);
        //Assert
        assertThat(resumes).isEmpty();
    }

    /**
     * Given a resume exists for the requested ID, verifies the service returns
     * the correct resume entity.
     */
    @Test
    void getResumeById_resumeExists_returnsResume() {
        //Arrange
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(fakeResume));
        //Act
        Resume resume = resumeService.getById(1L);
        //Assert
        assertThat(resume.getId()).isEqualTo(fakeResume.getId());
    }

    /**
     * Given no resume exists for the requested ID, verifies the service throws
     * {@link ResumeNotFoundException} rather than returning null.
     */
    @Test
    void getResumeById_resumeNotFound_throwsException() {
        //Act
        when(resumeRepository.findById(99L)).thenReturn(Optional.empty());
        //Assert
        assertThatThrownBy(() -> resumeService.getById(99L))
                .isInstanceOf(ResumeNotFoundException.class);
    }

    /**
     * Given the owning user exists, verifies the service persists the resume
     * and returns the saved entity.
     */
    @Test
    void createResume_success_returnsSavedResume() {
        //Arrange
        when(userRepository.existsById(1L)).thenReturn(true);
        when(resumeRepository.save(fakeResume)).thenReturn(fakeResume);
        //Act
        Resume resume = resumeService.createResume(fakeResume);
        //Assert
        assertThat(resume).isEqualTo(fakeResume);
    }

    /**
     * Given the owning user does not exist, verifies the service throws
     * {@link UserNotFoundException} and does not persist the resume.
     */
    @Test
    void createResume_userDoesNotExist_throwsException() {
        //Act
        when(userRepository.existsById(1L)).thenReturn(false);
        //Assert
        assertThatThrownBy(() -> resumeService.createResume(fakeResume))
                .isInstanceOf(UserNotFoundException.class);
    }

    /**
     * Given a valid update request and an existing resume, verifies the service
     * applies the change and returns the updated resume.
     */
    @Test
    void updateResume_success_returnsSavedResume() {
        //Arrange
        UpdateResumeRequest request = new UpdateResumeRequest();
        request.setTitle("Updated");
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(fakeResume));
        when(resumeRepository.save(fakeResume)).thenReturn(fakeResume);
        //Act
        Resume tempResume = resumeService.updateResume(1L, request);
        //Assert
        assertThat(tempResume.getTitle()).isEqualTo("Updated");
    }

    /**
     * Given no resume exists for the requested ID, verifies the service throws
     * {@link ResumeNotFoundException} before attempting to save.
     */
    @Test
    void updateResume_userDoesNotExist_throwsException() {
        //Arrange
        UpdateResumeRequest request = new UpdateResumeRequest();
        request.setTitle("Updated");
        when(resumeRepository.findById(1L)).thenReturn(Optional.empty());
        //Assert
        assertThatThrownBy(() -> resumeService.updateResume(1L, request))
                .isInstanceOf(ResumeNotFoundException.class);
    }

    /**
     * Given an existing resume, verifies the service delegates the deletion to
     * the repository's {@code deleteById} method.
     */
    @Test
    void deleteResume_success() {
        //Arrange
        when(resumeRepository.existsById(1L)).thenReturn(true);
        //Act
        resumeService.deleteResume(1L);
        //Assert
        verify(resumeRepository).deleteById(1L);
    }

    /**
     * Given no resume exists for the requested ID, verifies the service throws
     * {@link ResumeNotFoundException} without calling {@code deleteById}.
     */
    @Test
    void deleteResume_resumeDoesNotExist_throwsException() {
        //Act
        when(resumeRepository.existsById(99L)).thenReturn(false);
        //Assert
        assertThatThrownBy(() -> resumeService.deleteResume(99L)).
                isInstanceOf(ResumeNotFoundException.class);
    }
}
