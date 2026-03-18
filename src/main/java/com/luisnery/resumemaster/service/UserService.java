package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

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

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }


}
