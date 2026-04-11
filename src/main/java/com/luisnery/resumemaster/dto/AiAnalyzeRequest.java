package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code POST /api/ai/analyze} endpoint.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalyzeRequest {

    /** The full resume data JSON serialized by the frontend. Required. */
    @NotBlank(message = "Resume content is required")
    private String resumeContent; // full resumeData JSON from frontend

    /** Optional target job title that adds context to the analysis. */
    private String jobTitle;      // optional — adds context to the analysis
}