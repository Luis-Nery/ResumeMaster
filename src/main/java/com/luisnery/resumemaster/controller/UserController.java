package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.ChangePasswordRequest;
import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for user management operations.
 * All endpoints require a valid JWT token in the {@code Authorization} header.
 */
@Tag(name = "Users", description = "Manage user profiles")
@RestController
@RequestMapping("/api/users")
public class UserController {
    public final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves all registered users.
     *
     * @return a list of {@link UserResponse} objects for every user in the system
     */
    @Operation(summary = "Get all users", description = "Returns a list of all registered users")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream().
                map(UserResponse::fromEntity).
                collect(Collectors.toList());
    }

    /**
     * Retrieves a single user by their ID.
     *
     * @param id the ID of the user to retrieve
     * @return the matching {@link UserResponse}, or 404 if not found
     */
    @Operation(summary = "Get user by ID", description = "Returns a single user profile by their ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@Parameter(description = "User ID") @PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    /**
     * Updates an existing user's profile fields. Only non-blank fields in the request are applied.
     *
     * @param id      the ID of the user to update
     * @param request the fields to update
     * @return the updated {@link UserResponse}
     */
    @Operation(summary = "Update a user", description = "Updates profile fields for the specified user. Only provided non-blank fields are changed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@Parameter(description = "User ID") @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(id,request);
        return ResponseEntity.ok(UserResponse.fromEntity(updatedUser));
    }

    /**
     * Changes the password for the specified user after verifying the current password.
     *
     * @param id      the ID of the user
     * @param request the current and new passwords
     * @return 204 No Content on success, 400 if current password is wrong, 404 if not found
     */
    @Operation(summary = "Change password", description = "Verifies the current password then replaces it with the new one")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Current password is incorrect or validation failed"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@Parameter(description = "User ID") @PathVariable Long id,
                                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes a user by their ID.
     *
     * @param id the ID of the user to delete
     * @return 204 No Content on success, or 404 if not found
     */
    @Operation(summary = "Delete a user", description = "Permanently deletes the specified user account")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@Parameter(description = "User ID") @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
