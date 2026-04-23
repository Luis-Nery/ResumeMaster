package com.luisnery.resumemaster.dto;

import com.luisnery.resumemaster.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read-only projection of a {@link com.luisnery.resumemaster.model.User} entity returned by the API.
 * Excludes the password hash and any security-sensitive fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    /** The user's unique identifier. */
    private Long id;

    /** The user's first name (may be {@code null} if not set). */
    private String firstName;

    /** The user's last name (may be {@code null} if not set). */
    private String lastName;

    /** The user's email address. */
    private String email;

    /** The timestamp when the account was created. */
    private LocalDateTime createdAt;

    /** The Google subject ID if the account is linked to Google; {@code null} otherwise. */
    private String googleId;

    /**
     * Converts a {@link com.luisnery.resumemaster.model.User} entity to a {@link UserResponse}.
     *
     * @param user the entity to convert
     * @return a new {@link UserResponse} populated from the entity's fields
     */
    public static UserResponse fromEntity(User user) {
        return new UserResponse(user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getGoogleId());
    }


}
