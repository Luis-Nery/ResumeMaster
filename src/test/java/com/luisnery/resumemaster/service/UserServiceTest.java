package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserService}.
 * Uses Mockito to isolate the service from the repository layer so that each
 * test verifies a single piece of business logic without touching the database.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User fakeUser;

    @BeforeEach
    void setUp() {
        fakeUser = new User();
        fakeUser.setId(1L);
        fakeUser.setEmail("luis@test.com");
        fakeUser.setFirstName("Luis");
        fakeUser.setLastName("Nery");
        fakeUser.setPasswordHash("password123");
    }

    /**
     * Given the repository returns a non-empty list, verifies the service
     * propagates the list unchanged.
     */
    @Test
    void getAllUsers_returnsListOfUsers() {
        //Arrange
        when(userRepository.findAll()).thenReturn(List.of(fakeUser));
        //Act
        List<User> users = userService.getAllUsers();
        //Assert
        assertThat(users).hasSize(1);
    }

    /**
     * Given the repository returns an empty list, verifies the service
     * propagates the empty result without throwing.
     */
    @Test
    void getAllUsers_returnsEmptyList() {
        //Arrange
        when(userRepository.findAll()).thenReturn(List.of());
        //Act
        List<User> users = userService.getAllUsers();
        //Assess
        assertThat(users).isEmpty();
    }

    /**
     * Given a user exists for the requested ID, verifies the service returns
     * the correct user entity with matching id and email.
     */
    @Test
    void getUserById_userExists_returnsUser() {
        //Act
        when(userRepository.findById(1L)).thenReturn(Optional.of(fakeUser));

        //Assert
        User result = userService.getUserById(1L);
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("luis@test.com");
    }

    /**
     * Given no user exists for the requested ID, verifies the service throws
     * {@link UserNotFoundException} rather than returning null.
     */
    @Test
    void getUserById_userNotFound_throwsException() {
        //Act
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        //Assert
        assertThatThrownBy(() -> userService.getUserById(99L)).isInstanceOf(UserNotFoundException.class);
    }

    /**
     * Given a user with a unique email, verifies the service persists the user
     * and returns the saved entity.
     */
    @Test
    void createUser_success_returnsSavedUser() {
        //Arrange
        when(userRepository.existsByEmail(fakeUser.getEmail())).thenReturn(false);
        when(userRepository.save(fakeUser)).thenReturn(fakeUser);
        //Act
        User result = userService.createUser(fakeUser);
        //Assert
        assertThat(result).isEqualTo(fakeUser);
    }

    /**
     * Given an email address that is already registered, verifies the service
     * throws {@link IllegalArgumentException} and does not create a duplicate.
     */
    @Test
    void createUser_emailAlreadyExists_throwsException() {
        // Arrange
        when(userRepository.existsByEmail(fakeUser.getEmail())).thenReturn(true);
        //No acting here
        //Assert only
        assertThatThrownBy(() -> userService.createUser(fakeUser)).isInstanceOf(IllegalArgumentException.class);
    }

    /**
     * Given a valid update request and an existing user, verifies the service
     * applies the change and returns the updated user.
     */
    @Test
    void updateUser_success_returnsUpdatedUser() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");

        when(userRepository.findById(1L)).thenReturn(Optional.of(fakeUser));
        when(userRepository.save(fakeUser)).thenReturn(fakeUser);

        // Act
        User result = userService.updateUser(1L, request);

        // Assert
        assertThat(result.getFirstName()).isEqualTo("Updated");
    }

    /**
     * Given no user exists for the requested ID, verifies the service throws
     * {@link UserNotFoundException} before attempting to save.
     */
    @Test
    void updateUser_userNotFound_throwsException() {
        //Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        //Assert only
        assertThatThrownBy(() -> userService.updateUser(1L, request)).isInstanceOf(UserNotFoundException.class);
    }

    /**
     * Given an existing user, verifies the service delegates the deletion to
     * the repository's {@code deleteById} method.
     */
    @Test
    void deleteUser_success() {
        //Arrange
        when(userRepository.existsById(1L)).thenReturn(true);
        //Act
        userService.deleteUser(1L);
        //Assert
        verify(userRepository).deleteById(1L);
    }

    /**
     * Given no user exists for the requested ID, verifies the service throws
     * {@link UserNotFoundException} without calling {@code deleteById}.
     */
    @Test
    void deleteUser_userNotFound_throwsException() {
        //Arrange
        when(userRepository.existsById(1L)).thenReturn(false);
        //Act + Assert
        assertThatThrownBy(() -> userService.deleteUser(1L)).isInstanceOf(UserNotFoundException.class);
    }
}