package com.luisnery.resumemaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateResumeRequest {
    private String title;
    private String content;
    private Boolean isComplete;
    private Integer currentStep;
}
