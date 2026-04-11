package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for user management.
 * Handles business logic for creating, retrieving, updating, and deleting users.
 */
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns all users in the system.
     *
     * @return a list of all {@link User} entities
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Returns a user by their ID.
     *
     * @param id the user's ID
     * @return the matching {@link User}
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if no user with the given ID exists
     */
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Persists a new user after verifying the email is not already taken.
     *
     * @param user the {@link User} entity to save (password must already be encoded)
     * @return the saved {@link User} with a generated ID
     * @throws IllegalArgumentException if the email is already registered
     */
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    /**
     * Applies a partial update to an existing user. Only non-blank fields in the request are changed.
     *
     * @param id                the ID of the user to update
     * @param updateUserRequest the fields to update
     * @return the saved {@link User} with the updated values
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if no user with the given ID exists
     */
    public User updateUser(Long id, UpdateUserRequest updateUserRequest) {
        User tempUser = getUserById(id);
        if (updateUserRequest.getEmail() != null && !updateUserRequest.getEmail().isBlank()) {
            tempUser.setEmail(updateUserRequest.getEmail());
        }
        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isBlank()) {
            tempUser.setPasswordHash(updateUserRequest.getPassword());
        }
        if (updateUserRequest.getFirstName() != null && !updateUserRequest.getFirstName().isBlank()) {
            tempUser.setFirstName(updateUserRequest.getFirstName());
        }
        if (updateUserRequest.getLastName() != null && !updateUserRequest.getLastName().isBlank()) {
            tempUser.setLastName(updateUserRequest.getLastName());
        }
        return userRepository.save(tempUser);
    }

    /**
     * Deletes a user by their ID.
     *
     * @param id the ID of the user to delete
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if no user with the given ID exists
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }


}
