package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.AiAnalyzeRequest;
import com.luisnery.resumemaster.dto.AiMatchRequest;
import com.luisnery.resumemaster.dto.AiRewriteRequest;
import com.luisnery.resumemaster.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for AI-powered resume features.
 * Delegates to {@link AiService} which calls the Anthropic Claude API.
 * All endpoints require a valid JWT token in the {@code Authorization} header.
 */
@Tag(name = "AI", description = "AI-powered resume analysis, bullet rewriting, and job description matching")
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Analyzes a full resume and returns a structured score with per-section feedback.
     *
     * @param request the resume content JSON and an optional target job title
     * @return a map containing {@code overallScore}, per-section scores/feedback, and an overall assessment
     * @throws Exception if the Anthropic API call fails
     */
    @Operation(summary = "Analyze a resume",
               description = "Scores the resume and returns per-section feedback for summary, experience, and skills. Optionally tailored to a target job title.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Analysis returned successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "500", description = "Anthropic API error")
    })
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(@Valid @RequestBody AiAnalyzeRequest request) throws Exception {
        return ResponseEntity.ok(aiService.analyzeResume(request));
    }

    /**
     * Rewrites a single resume bullet point into three improved variations.
     *
     * @param request the original bullet text and an optional target job title
     * @return a map containing a {@code rewrites} list, each with rewritten text and an improvement note
     * @throws Exception if the Anthropic API call fails
     */
    @Operation(summary = "Rewrite a bullet point",
               description = "Generates three ATS-friendly rewrites of a resume bullet point, each starting with a strong action verb")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rewrites returned successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "500", description = "Anthropic API error")
    })
    @PostMapping("/rewrite")
    public ResponseEntity<Map<String, Object>> rewrite(@Valid @RequestBody AiRewriteRequest request) throws Exception {
        return ResponseEntity.ok(aiService.rewriteBullet(request));
    }

    /**
     * Compares a resume against a job description and returns an ATS match score with keyword analysis.
     *
     * @param request the resume content and the job description text
     * @return a map containing a {@code score}, matched/missing keywords, feedback, and improvement suggestions
     * @throws Exception if the Anthropic API call fails
     */
    @Operation(summary = "Match resume to job description",
               description = "Computes an ATS match score (0–100) and lists matched/missing keywords between the resume and job description")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Match result returned successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "500", description = "Anthropic API error")
    })
    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> match(@Valid @RequestBody AiMatchRequest request) throws Exception {
        return ResponseEntity.ok(aiService.matchJobDescription(request));
    }
}