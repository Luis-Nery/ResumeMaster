package com.luisnery.resumemaster.controller;


import com.luisnery.resumemaster.dto.CreateResumeRequest;
import com.luisnery.resumemaster.dto.ResumeResponse;
import com.luisnery.resumemaster.dto.UpdateResumeRequest;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.service.ResumeService;
import com.luisnery.resumemaster.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for resume CRUD operations.
 * Resumes are always scoped to a specific user.
 * All endpoints require a valid JWT token in the {@code Authorization} header.
 */
@Tag(name = "Resumes", description = "Create, read, update, and delete resumes")
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private final ResumeService resumeService;
    private final UserService userService;

    public ResumeController(ResumeService resumeService, UserService userService) {
        this.resumeService = resumeService;
        this.userService = userService;
    }

    /**
     * Retrieves all resumes belonging to a specific user.
     *
     * @param userId the ID of the user whose resumes to retrieve
     * @return a list of {@link ResumeResponse} objects
     */
    @Operation(summary = "Get all resumes for a user", description = "Returns all resumes associated with the given user ID")
    @ApiResponse(responseCode = "200", description = "Resumes retrieved successfully")
    @GetMapping("/user/{userId}")
    public List<ResumeResponse> getAllResumesByUserId(@Parameter(description = "User ID") @PathVariable Long userId) {
        return resumeService.getAllByUserId(userId).stream()
                .map(ResumeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single resume by its ID.
     *
     * @param id the ID of the resume to retrieve
     * @return the matching {@link ResumeResponse}, or 404 if not found
     */
    @Operation(summary = "Get a resume by ID", description = "Returns a single resume by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Resume found"),
        @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResumeById(@Parameter(description = "Resume ID") @PathVariable Long id) {
        Resume resume = resumeService.getById(id);
        return ResponseEntity.ok(ResumeResponse.fromEntity(resume));
    }

    /**
     * Creates a new resume for an existing user.
     *
     * @param resume the creation payload containing title, content, and the owning user's ID
     * @return the newly created {@link ResumeResponse} with HTTP 201
     */
    @Operation(summary = "Create a resume", description = "Creates a new resume and associates it with the specified user")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Resume created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(@Valid @RequestBody CreateResumeRequest resume) {
        Resume tempResume = new Resume();
        tempResume.setTitle(resume.getTitle());
        tempResume.setContent(resume.getContent());
        tempResume.setUser(userService.getUserById(resume.getUserId()));
        Resume createdResume = resumeService.createResume(tempResume);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResumeResponse.fromEntity(createdResume));
    }

    /**
     * Updates an existing resume. Only non-null fields in the request body are applied.
     *
     * @param id                  the ID of the resume to update
     * @param updateResumeRequest the fields to update (title, content, completion status, current step)
     * @return the updated {@link ResumeResponse}
     */
    @Operation(summary = "Update a resume", description = "Updates the specified resume. Only provided non-null fields are changed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Resume updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ResumeResponse> updateResume(@Parameter(description = "Resume ID") @PathVariable Long id, @Valid @RequestBody UpdateResumeRequest updateResumeRequest) {
        Resume updatedResume = resumeService.updateResume(id, updateResumeRequest);
        return ResponseEntity.ok(ResumeResponse.fromEntity(updatedResume));
    }

    /**
     * Deletes a resume by its ID.
     *
     * @param id the ID of the resume to delete
     * @return 204 No Content on success, or 404 if not found
     */
    @Operation(summary = "Delete a resume", description = "Permanently deletes the specified resume")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Resume deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@Parameter(description = "Resume ID") @PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }
}
