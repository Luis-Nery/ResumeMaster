package com.luisnery.resumemaster.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisnery.resumemaster.dto.AiAnalyzeRequest;
import com.luisnery.resumemaster.dto.AiMatchRequest;
import com.luisnery.resumemaster.dto.AiRewriteRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    // ─── Feature 1: Full resume analysis ────────────────────────────────────

    public Map<String, Object> analyzeResume(AiAnalyzeRequest request) throws Exception {
        String jobContext = (request.getJobTitle() != null && !request.getJobTitle().isBlank())
                ? "The candidate is targeting the role: " + request.getJobTitle() + ".\n"
                : "";

        String prompt = """
                You are an expert resume coach and ATS specialist.
                %sAnalyze the following resume data (JSON format) and return ONLY a JSON object — no markdown, no explanation.
                
                Resume data:
                %s
                
                Return exactly this JSON structure:
                {
                  "overallScore": <number 0-100>,
                  "summary": {
                    "score": <number 0-100>,
                    "feedback": "<what is good or bad about this summary>",
                    "suggestion": "<one specific rewrite suggestion>"
                  },
                  "experience": {
                    "score": <number 0-100>,
                    "feedback": "<assessment of experience bullet points>",
                    "suggestions": ["<tip 1>", "<tip 2>", "<tip 3>"]
                  },
                  "skills": {
                    "score": <number 0-100>,
                    "feedback": "<assessment of skills section>",
                    "suggestion": "<one specific improvement>"
                  },
                  "overall": "<2-3 sentence overall assessment and top priority action>"
                }
                """.formatted(jobContext, request.getResumeContent());

        return callAnthropicApi(prompt);
    }

    // ─── Feature 2: Rewrite a bullet point ──────────────────────────────────

    public Map<String, Object> rewriteBullet(AiRewriteRequest request) throws Exception {
        String jobContext = (request.getJobTitle() != null && !request.getJobTitle().isBlank())
                ? " The target role is: " + request.getJobTitle() + "."
                : "";

        String prompt = """
                You are an expert resume writer specializing in impactful bullet points.%s
                Rewrite the following resume bullet point 3 different ways.
                Each rewrite should: start with a strong action verb, quantify impact where possible, and be ATS-friendly.
                
                Original bullet: %s
                
                Return ONLY a JSON object — no markdown, no explanation:
                {
                  "rewrites": [
                    { "text": "<rewrite 1>", "improvement": "<what makes this better>" },
                    { "text": "<rewrite 2>", "improvement": "<what makes this better>" },
                    { "text": "<rewrite 3>", "improvement": "<what makes this better>" }
                  ]
                }
                """.formatted(jobContext, request.getBulletText());

        return callAnthropicApi(prompt);
    }

    // ─── Feature 3: Job description ATS match ───────────────────────────────

    public Map<String, Object> matchJobDescription(AiMatchRequest request) throws Exception {
        String prompt = """
                You are an ATS (Applicant Tracking System) expert.
                Compare the resume below against the job description and return ONLY a JSON object — no markdown, no explanation.
                
                Resume:
                %s
                
                Job Description:
                %s
                
                Return exactly this JSON structure:
                {
                  "score": <number 0-100 representing match percentage>,
                  "matchedKeywords": ["<keyword 1>", "<keyword 2>", ...],
                  "missingKeywords": ["<missing 1>", "<missing 2>", ...],
                  "feedback": "<2-3 sentence overall assessment>",
                  "suggestions": ["<action 1>", "<action 2>", "<action 3>"]
                }
                """.formatted(request.getResumeContent(), request.getJobDescription());

        return callAnthropicApi(prompt);
    }

    // ─── Shared HTTP call to Anthropic API ──────────────────────────────────

    private Map<String, Object> callAnthropicApi(String userPrompt) throws Exception {
        Map<String, Object> requestBody = Map.of(
                "model", "claude-haiku-4-5-20251001",
                "max_tokens", 1024,
                "messages", List.of(
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Anthropic API error " + response.statusCode() + ": " + response.body());
        }

        Map<?, ?> parsed = objectMapper.readValue(response.body(), Map.class);
        List<?> content = (List<?>) parsed.get("content");
        Map<?, ?> firstBlock = (Map<?, ?>) content.get(0);
        String textContent = (String) firstBlock.get("text");
        String cleaned = textContent.strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").strip();
        }
        return objectMapper.readValue(cleaned, Map.class);
    }
}