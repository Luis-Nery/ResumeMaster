package com.luisnery.resumemaster.service;

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

    @Test
    void getAllUsers_returnsListOfUsers() {
        //Arrange
        when(userRepository.findAll()).thenReturn(List.of(fakeUser));
        //Act
        List<User> users = userService.getAllUsers();
        //Assert
        assertThat(users).hasSize(1);
    }

    @Test
    void getAllUsers_returnsEmptyList() {
        //Arrange
        when(userRepository.findAll()).thenReturn(List.of());
        //Act
        List<User> users = userService.getAllUsers();
        //Assess
        assertThat(users).isEmpty();
    }

    @Test
    void getUserById_userExists_returnsUser() {
        //Act
        when(userRepository.findById(1L)).thenReturn(Optional.of(fakeUser));

        //Assert
        User result = userService.getUserById(1L);
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("luis@test.com");
    }

    @Test
    void getUserById_userNotFound_throwsException() {
        //Act
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        //Assert
        assertThatThrownBy(() -> userService.getUserById(99L)).isInstanceOf(UserNotFoundException.class);
    }

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

    @Test
    void createUser_emailAlreadyExists_throwsException() {
        // Arrange
        when(userRepository.existsByEmail(fakeUser.getEmail())).thenReturn(true);
        //No acting here
        //Assert only
        assertThatThrownBy(() -> userService.createUser(fakeUser)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteUser_success() {
        //Arrange
        when(userRepository.existsById(1L)).thenReturn(true);
        //Act
        userService.deleteUser(1L);
        //Assert
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_userNotFound_throwsException() {
        //Arrange
        when(userRepository.existsById(1L)).thenReturn(false);
        //Act + Assert
        assertThatThrownBy(() -> userService.deleteUser(1L)).isInstanceOf(UserNotFoundException.class);
    }
}