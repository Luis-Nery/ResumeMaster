package com.luisnery.resumemaster.repository;

import com.luisnery.resumemaster.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 * Provides standard CRUD operations plus email-based lookup methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address (exact, case-sensitive match).
     *
     * @param email the email to search for
     * @return an {@link Optional} containing the user if found, or empty otherwise
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by email using a case-insensitive comparison.
     * Used during OAuth2 login so that email casing differences between
     * what was registered and what Google returns never create a duplicate account.
     *
     * @param email the email to search for
     * @return an {@link Optional} containing the user if found, or empty otherwise
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Checks whether a user with the given email address already exists.
     *
     * @param email the email to check
     * @return {@code true} if a user with this email exists; {@code false} otherwise
     */
    boolean existsByEmail(String email);
}
