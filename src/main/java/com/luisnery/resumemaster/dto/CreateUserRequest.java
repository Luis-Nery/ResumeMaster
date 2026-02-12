package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min =8,message = "Password must be at least 8 characters")
    private String password;
    @NotBlank(message = "First Name is required")
    @Size(min = 2,max = 50,message="Your name must be between 2-50 characters")
    private String firstName;
    @NotBlank(message = "Last Name is required")
    @Size(min =2,max = 50,message = "Your last name must be between 2-50 characters")
    private String lastName;
}
