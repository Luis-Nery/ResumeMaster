package com.luisnery.resumemaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiRewriteRequest {
    @NotBlank(message = "Bullet text is required")
    private String bulletText;
    private String jobTitle; // optional — helps tailor the rewrites
}