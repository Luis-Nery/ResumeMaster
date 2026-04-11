package com.luisnery.resumemaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for both {@code POST /api/auth/register} and {@code POST /api/auth/login}.
 * Contains the signed JWT the client must include in subsequent requests.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    /** The signed JWT token to be sent as {@code Authorization: Bearer <token>}. */
    private String authToken;

    /** The ID of the authenticated or newly registered user. */
    private Long userId;
}
