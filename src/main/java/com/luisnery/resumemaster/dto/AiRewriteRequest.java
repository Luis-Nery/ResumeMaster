package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code POST /api/ai/rewrite} endpoint.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiRewriteRequest {

    /** The original resume bullet point text to rewrite. Required. */
    @NotBlank(message = "Bullet text is required")
    private String bulletText;

    /** Optional target job title that tailors the rewrites toward a specific role. */
    private String jobTitle; // optional — helps tailor the rewrites
}