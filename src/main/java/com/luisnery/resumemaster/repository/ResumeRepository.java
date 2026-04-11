package com.luisnery.resumemaster.repository;

import com.luisnery.resumemaster.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Resume} entities.
 * Provides standard CRUD operations plus a user-scoped lookup method.
 */
@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    /**
     * Returns all resumes owned by the specified user.
     *
     * @param userId the ID of the owning user
     * @return a (possibly empty) list of resumes belonging to that user
     */
    List<Resume> findByUserId(Long userId);
}
