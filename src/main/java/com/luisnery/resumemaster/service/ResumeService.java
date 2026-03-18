package com.luisnery.resumemaster.service;

import com.luisnery.resumemaster.dto.UpdateResumeRequest;
import com.luisnery.resumemaster.exception.ResumeNotFoundException;
import com.luisnery.resumemaster.exception.UserNotFoundException;
import com.luisnery.resumemaster.model.Resume;
import com.luisnery.resumemaster.repository.ResumeRepository;
import com.luisnery.resumemaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public List<Resume> getAllByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Resume getById(Long id) {
        return resumeRepository.findById(id).orElseThrow(() -> new ResumeNotFoundException(id));
    }

    public Resume createResume(Resume resume) {
        if (!userRepository.existsById(resume.getUser().getId())) {
            throw new UserNotFoundException(resume.getUser().getId());
        }
        return resumeRepository.save(resume);
    }

    public Resume updateResume(Long id, UpdateResumeRequest updateResumeRequest) {
        Resume tempResume = getById(id);
        if (updateResumeRequest.getTitle() != null && !updateResumeRequest.getTitle().isBlank()) {
            tempResume.setTitle(updateResumeRequest.getTitle());
        }
        if (updateResumeRequest.getContent() != null && !updateResumeRequest.getContent().isBlank()) {
            tempResume.setContent(updateResumeRequest.getContent());
        }
        return resumeRepository.save(tempResume);
    }

    public void deleteResume(Long id) {
        if (!resumeRepository.existsById(id)) {
            throw new ResumeNotFoundException(id);
        }
        resumeRepository.deleteById(id);
    }
}
