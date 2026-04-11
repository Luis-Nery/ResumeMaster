package com.luisnery.resumemaster.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * JPA entity representing a registered user.
 * Implements {@link UserDetails} so Spring Security can use it directly for authentication.
 * The username in this application is the user's email address.
 */
@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique email address used as the login username. */
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt-hashed password. Never stored in plain text. */
    @Column(nullable = false)
    private String passwordHash;

    /** Optional first name for display purposes. */
    @Column(nullable = true)
    private String firstName;

    /** Optional last name for display purposes. */
    @Column(nullable = true)
    private String lastName;

    /** Timestamp set automatically when the record is first persisted. */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /** Whether the account is active. Defaults to {@code true}. */
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
}
