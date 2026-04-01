package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalyzeRequest {
    @NotBlank(message = "Resume content is required")
    private String resumeContent; // full resumeData JSON from frontend
    private String jobTitle;      // optional — adds context to the analysis
}