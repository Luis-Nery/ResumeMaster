package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiMatchRequest {
    @NotBlank(message = "Resume content is required")
    private String resumeContent;
    @NotBlank(message = "Job description is required")
    private String jobDescription;
}