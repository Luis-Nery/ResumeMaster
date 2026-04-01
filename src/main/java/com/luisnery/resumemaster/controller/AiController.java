package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.AiAnalyzeRequest;
import com.luisnery.resumemaster.dto.AiMatchRequest;
import com.luisnery.resumemaster.dto.AiRewriteRequest;
import com.luisnery.resumemaster.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(@Valid @RequestBody AiAnalyzeRequest request) throws Exception {
        return ResponseEntity.ok(aiService.analyzeResume(request));
    }

    @PostMapping("/rewrite")
    public ResponseEntity<Map<String, Object>> rewrite(@Valid @RequestBody AiRewriteRequest request) throws Exception {
        return ResponseEntity.ok(aiService.rewriteBullet(request));
    }

    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> match(@Valid @RequestBody AiMatchRequest request) throws Exception {
        return ResponseEntity.ok(aiService.matchJobDescription(request));
    }
}