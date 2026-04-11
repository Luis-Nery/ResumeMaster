package com.luisnery.resumemaster.exception;

/**
 * Thrown by the service layer when a requested resume cannot be found in the database.
 * Mapped to a 404 response by {@link GlobalExceptionHandler}.
 */
public class ResumeNotFoundException extends RuntimeException {

    /**
     * Creates the exception with a message referencing the missing resume's ID.
     *
     * @param id the ID that was not found
     */
    public ResumeNotFoundException(Long id) {
        super("Resume with id "+ id+ " not found.");
    }
}
