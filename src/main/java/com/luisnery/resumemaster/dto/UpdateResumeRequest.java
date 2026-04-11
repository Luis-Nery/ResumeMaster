package com.luisnery.resumemaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the {@code PUT /api/resumes/{id}} endpoint.
 * All fields are optional; only non-null provided values are applied to the resume.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateResumeRequest {

    /** New title for the resume. Ignored if blank. */
    private String title;

    /** New JSON content for the resume. Ignored if blank. */
    private String content;

    /** Updated completion status. */
    private Boolean isComplete;

    /** Updated step number in the multi-step builder. */
    private Integer currentStep;
}
