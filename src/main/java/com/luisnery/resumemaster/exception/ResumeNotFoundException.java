package com.luisnery.resumemaster.exception;

public class ResumeNotFoundException extends RuntimeException {
    public ResumeNotFoundException(Long id) {
        super("Resume with id "+ id+ " not found.");
    }
}
