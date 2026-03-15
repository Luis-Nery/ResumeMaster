package com.luisnery.resumemaster.controller;


import com.luisnery.resumemaster.dto.CreateResumeRequest;
import com.luisnery.resumemaster.dto.ResumeResponse;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.service.ResumeService;
import com.luisnery.resumemaster.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private final ResumeService resumeService;
    private final UserService userService;

    public ResumeController(ResumeService resumeService, UserService userService) {
        this.resumeService = resumeService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public List<ResumeResponse> getAllResumesByUserId(@PathVariable Long userId) {
        return resumeService.getAllByUserId(userId).stream()
                .map(ResumeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResumeById(@PathVariable Long id) {
        Resume resume = resumeService.getById(id);
        return ResponseEntity.ok(ResumeResponse.fromEntity(resume));
    }

    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(@Valid @RequestBody CreateResumeRequest resume) {
        Resume tempResume = new Resume();
        tempResume.setTitle(resume.getTitle());
        tempResume.setContent(resume.getContent());
        tempResume.setUser(userService.getUserById(resume.getUserId()));
        Resume createdResume = resumeService.createResume(tempResume);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResumeResponse.fromEntity(createdResume));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }
}
