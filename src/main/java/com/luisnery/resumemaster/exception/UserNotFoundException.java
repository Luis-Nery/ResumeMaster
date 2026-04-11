package com.luisnery.resumemaster.exception;

/**
 * Thrown by the service layer when a requested user cannot be found in the database.
 * Mapped to a 404 response by {@link GlobalExceptionHandler}.
 */
public class UserNotFoundException extends RuntimeException {

    /**
     * Creates the exception with a message referencing the missing user's ID.
     *
     * @param id the ID that was not found
     */
    public UserNotFoundException(Long id) {
        super("User with id " + id + " not found");
    }

    /**
     * Creates the exception with a custom message.
     *
     * @param message the detail message
     */
    public UserNotFoundException(String message) {
        super(message);
    }
}
