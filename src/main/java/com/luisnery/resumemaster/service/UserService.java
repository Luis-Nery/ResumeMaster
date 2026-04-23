package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.ChangePasswordRequest;
import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for user management.
 * Handles business logic for creating, retrieving, updating, and deleting users.
 */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
     * Changes the password for a user after verifying the current password.
     *
     * @param id      the ID of the user
     * @param request carries {@code currentPassword} (for verification) and {@code newPassword}
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if no user with the given ID exists
     * @throws IllegalArgumentException if {@code currentPassword} does not match the stored hash
     */
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Finds an existing user by Google email (case-insensitive) or creates a new one.
     * Used for the login / register flow where first-time Google sign-up must succeed.
     * The existing user's {@code authProvider} is never changed; new users get
     * {@code authProvider="google"} and no password hash.
     *
     * @param googleEmail the email returned by Google
     * @param name        the full name returned by Google (may be null)
     * @param googleId    the Google subject ID
     * @return the existing user (with their original ID) or a newly created one
     */
    public User findOrCreateOAuth2User(String googleEmail, String name, String googleId) {
        return userRepository.findByEmailIgnoreCase(googleEmail)
                .map(user -> {
                    if (user.getGoogleId() == null) {
                        user.setGoogleId(googleId);
                        return userRepository.save(user);
                    }
                    return user;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(googleEmail);
                    newUser.setGoogleId(googleId);
                    newUser.setAuthProvider("google");
                    if (name != null && !name.isBlank()) {
                        String[] parts = name.split(" ", 2);
                        newUser.setFirstName(parts[0]);
                        if (parts.length > 1) {
                            newUser.setLastName(parts[1]);
                        }
                    }
                    return userRepository.save(newUser);
                });
    }

    /**
     * Looks up an existing user by Google email (case-insensitive) and links their googleId
     * if not already set. Returns {@code null} when no account with that email exists —
     * the caller is responsible for redirecting with an error rather than creating a new user.
     * The user's {@code authProvider} is never changed.
     *
     * @param googleEmail the email returned by Google
     * @param googleId    the Google subject ID
     * @return the existing {@link User} with their original ID, or {@code null} if not found
     */
    public User findExistingOAuth2User(String googleEmail, String googleId) {
        return userRepository.findByEmailIgnoreCase(googleEmail)
                .map(user -> {
                    // Never change authProvider — keep whatever the user originally registered with.
                    if (user.getGoogleId() == null) {
                        user.setGoogleId(googleId);
                        return userRepository.save(user);
                    }
                    return user;
                })
                .orElse(null);
    }

    /**
     * Links a Google account to an existing user, identified by their internal ID.
     * The Google email must match the user's registered email (case-insensitive); if it
     * doesn't, {@code null} is returned and no changes are made. The {@code googleId} is
     * only written if the user does not already have one.
     *
     * @param userId      the ID of the currently authenticated user initiating the link
     * @param googleId    the Google subject ID returned by the OAuth2 flow
     * @param googleEmail the email returned by Google, used to verify identity
     * @return the updated {@link User}, or {@code null} if the emails do not match
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if no user with the given ID exists
     */
    public User linkGoogleAccount(Long userId, String googleId, String googleEmail) {
        User user = getUserById(userId);
        if (!user.getEmail().equalsIgnoreCase(googleEmail)) {
            return null;
        }
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
        }
        return user;
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
