package com.luisnery.resumemaster.dto;

import com.luisnery.resumemaster.model.Resume;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read-only projection of a {@link com.luisnery.resumemaster.model.Resume} entity returned by the API.
 * Includes the owning user as a nested {@link UserResponse}.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumeResponse {

    /** The resume's unique identifier. */
    private Long id;

    /** The resume's human-readable title. */
    private String title;

    /** The resume data serialized as a JSON string. */
    private String content;

    /** The timestamp when the resume was created. */
    private LocalDateTime createdAt;

    /** The timestamp when the resume was last saved. */
    private LocalDateTime lastModified;

    /** The user who owns this resume. */
    private UserResponse user;

    /** Whether the user has completed all steps of the resume builder. */
    private boolean isComplete;

    /** The last step reached in the multi-step builder. */
    private int currentStep;

    /**
     * Converts a {@link com.luisnery.resumemaster.model.Resume} entity to a {@link ResumeResponse}.
     *
     * @param resume the entity to convert
     * @return a new {@link ResumeResponse} populated from the entity's fields
     */
    public static ResumeResponse fromEntity(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getTitle(),
                resume.getContent(),
                resume.getCreatedAt(),
                resume.getLastModified(),
                UserResponse.fromEntity(resume.getUser()),
                resume.isComplete(),
                resume.getCurrentStep()
        );
    }
}
