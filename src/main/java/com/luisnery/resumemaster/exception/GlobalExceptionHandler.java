package com.luisnery.resumemaster.exception;

import com.luisnery.resumemaster.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralized exception handler for all REST controllers.
 * Maps application and validation exceptions to structured {@link com.luisnery.resumemaster.dto.ErrorResponse}
 * bodies with appropriate HTTP status codes.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles {@link UserNotFoundException} and returns a 404 response.
     *
     * @param ex the exception thrown when a user is not found
     * @return a 404 response with the exception message
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    /**
     * Handles {@link ResumeNotFoundException} and returns a 404 response.
     *
     * @param ex the exception thrown when a resume is not found
     * @return a 404 response with the exception message
     */
    @ExceptionHandler(ResumeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResumeNotFound(ResumeNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    /**
     * Handles {@link IllegalArgumentException} (e.g. duplicate email on registration) and returns a 400 response.
     *
     * @param ex the exception thrown for bad input that passes bean validation but fails business rules
     * @return a 400 response with the exception message
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /**
     * Handles {@link BadCredentialsException} thrown by the {@link org.springframework.security.authentication.AuthenticationManager}
     * when login credentials are incorrect, and returns a 401 response.
     *
     * @param ex the exception thrown when credentials do not match
     * @return a 401 response with the exception message
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), ex.getMessage()));
    }

    /**
     * Handles bean validation failures ({@code @Valid} on request bodies) and returns a 400 response
     * with a map of field names to their error messages.
     *
     * @param ex the exception containing the binding result with all field errors
     * @return a 400 response whose body is a {@code Map<fieldName, errorMessage>}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Catch-all handler for any unhandled exception. Returns a 500 response.
     *
     * @param ex the unhandled exception
     * @return a 500 response with the exception message
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage()));
    }
}