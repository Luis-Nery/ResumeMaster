package com.luisnery.resumemaster.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a resume document.
 * The resume content is stored as a JSON string ({@code TEXT} column) that the frontend
 * serializes from and deserializes to its internal resume data model.
 */
@Entity
@Table(name = "resumes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Resume {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable title for the resume (max 70 characters). */
    @Column(nullable = false)
    private String title;

    /** Full resume data serialized as a JSON string by the frontend. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Timestamp set automatically when the record is first persisted. */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /** Timestamp updated automatically on every save. */
    @UpdateTimestamp
    private LocalDateTime lastModified;

    /** Whether the user has finished all steps of the resume builder. Defaults to {@code false}. */
    @Column(nullable = false)
    private boolean isComplete = false;

    /** The step in the multi-step form the user last completed. Defaults to {@code 1}. */
    @Column(nullable = false)
    private int currentStep = 1;

    /** The user who owns this resume. */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
