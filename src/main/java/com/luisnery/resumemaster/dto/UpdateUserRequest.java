package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
