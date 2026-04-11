package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code POST /api/resumes} endpoint.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateResumeRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 70, message = "Your title should be between 1-70 characters long")
    private String title;
    @NotBlank(message = "Content can not be blank")
    private String content;
    @NotNull(message = "User ID is required")
    private Long userId;
}
