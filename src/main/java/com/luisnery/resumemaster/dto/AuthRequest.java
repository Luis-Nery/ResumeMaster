package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @NotBlank(message = "The email is required.")
    private String email;
    @NotBlank(message = "The password is required.")
    private String password;
}
