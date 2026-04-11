package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateResumeRequest;
import com.luisnery.resumemaster.exception.ResumeNotFoundException;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.repository.ResumeRepository;
import com.luisnery.resumemaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer for resume management.
 * Handles business logic for creating, retrieving, updating, and deleting resumes.
 */
@Service
public class ResumeService {
    //*
    //Set up dependency injecting
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    //*
    /**
     * Returns all resumes owned by the specified user.
     *
     * @param userId the ID of the owning user
     * @return a (possibly empty) list of {@link Resume} entities
     */
    public List<Resume> getAllByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    /**
     * Returns a resume by its ID.
     *
     * @param id the resume's ID
     * @return the matching {@link Resume}
     * @throws com.luisnery.resumemaster.exception.ResumeNotFoundException if no resume with the given ID exists
     */
    public Resume getById(Long id) {
        return resumeRepository.findById(id).orElseThrow(() -> new ResumeNotFoundException(id));
    }

    /**
     * Persists a new resume after verifying its owning user exists.
     *
     * @param resume the {@link Resume} entity to save (must have a non-null {@code user} with a valid ID)
     * @return the saved {@link Resume} with a generated ID
     * @throws com.luisnery.resumemaster.exception.UserNotFoundException if the owning user does not exist
     */
    public Resume createResume(Resume resume) {
        if (!userRepository.existsById(resume.getUser().getId())) {
            throw new UserNotFoundException(resume.getUser().getId());
        }
        return resumeRepository.save(resume);
    }

    /**
     * Applies a partial update to an existing resume. Only non-null/non-blank fields are changed.
     *
     * @param id                  the ID of the resume to update
     * @param updateResumeRequest the fields to update (title, content, completion status, current step)
     * @return the saved {@link Resume} with the updated values
     * @throws com.luisnery.resumemaster.exception.ResumeNotFoundException if no resume with the given ID exists
     */
    public Resume updateResume(Long id, UpdateResumeRequest updateResumeRequest) {
        Resume tempResume = getById(id);
        if (updateResumeRequest.getTitle() != null && !updateResumeRequest.getTitle().isBlank()) {
            tempResume.setTitle(updateResumeRequest.getTitle());
        }
        if (updateResumeRequest.getContent() != null && !updateResumeRequest.getContent().isBlank()) {
            tempResume.setContent(updateResumeRequest.getContent());
        }
        if (updateResumeRequest.getIsComplete() != null) {
            tempResume.setComplete(updateResumeRequest.getIsComplete());
        }
        if (updateResumeRequest.getCurrentStep() != null) {
            tempResume.setCurrentStep(updateResumeRequest.getCurrentStep());
        }
        return resumeRepository.save(tempResume);
    }

    /**
     * Deletes a resume by its ID.
     *
     * @param id the ID of the resume to delete
     * @throws com.luisnery.resumemaster.exception.ResumeNotFoundException if no resume with the given ID exists
     */
    public void deleteResume(Long id) {
        if (!resumeRepository.existsById(id)) {
            throw new ResumeNotFoundException(id);
        }
        resumeRepository.deleteById(id);
    }
}
