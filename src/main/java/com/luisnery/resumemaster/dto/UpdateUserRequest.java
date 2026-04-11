package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code PUT /api/users/{id}} endpoint.
 * All fields are optional; only non-blank provided values are applied to the user.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    @Email(message = "Email must be valid")
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
