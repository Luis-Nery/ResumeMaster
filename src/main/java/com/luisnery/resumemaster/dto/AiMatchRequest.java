package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code POST /api/ai/match} endpoint.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiMatchRequest {

    /** The full resume data JSON serialized by the frontend. Required. */
    @NotBlank(message = "Resume content is required")
    private String resumeContent;

    /** The full job description text to compare the resume against. Required. */
    @NotBlank(message = "Job description is required")
    private String jobDescription;
}