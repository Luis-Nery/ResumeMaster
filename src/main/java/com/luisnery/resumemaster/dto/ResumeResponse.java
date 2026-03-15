package com.luisnery.resumemaster.dto;

import com.luisnery.resumemaster.model.Resume;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumeResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private UserResponse user;

    public static ResumeResponse fromEntity(Resume resume) {
        return new ResumeResponse(resume.getId(),
                resume.getTitle(),
                resume.getContent(),
                resume.getCreatedAt(),
                resume.getLastModified(),
                UserResponse.fromEntity(resume.getUser()));
    }
}
