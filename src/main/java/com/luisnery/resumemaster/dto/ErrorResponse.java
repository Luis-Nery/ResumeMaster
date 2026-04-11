package com.luisnery.resumemaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response body returned by {@link com.luisnery.resumemaster.exception.GlobalExceptionHandler}
 * for all error responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /** The HTTP status code of the error (e.g. 400, 404, 500). */
    private int status;

    /** A human-readable description of what went wrong. */
    private String message;

    /** The timestamp when the error occurred. */
    private LocalDateTime timestamp;

    /**
     * Convenience constructor that sets {@code timestamp} to the current time.
     *
     * @param status  the HTTP status code
     * @param message the error message
     */
    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
