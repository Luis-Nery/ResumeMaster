package com.luisnery.resumemaster.security;

import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.JwtService;
import com.luisnery.resumemaster.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handles a successful Google OAuth2 authentication.
 *
 * <p>The {@code mode} value is read from the HTTP session attribute written by
 * {@link OAuth2ModePreservingRepository} at the moment Spring Security removes the authorization
 * request (before calling this handler). This avoids both the session-loss issue from session
 * fixation protection and the {@code ClassCastException} caused by casting {@code authentication}
 * to {@code OAuth2LoginAuthenticationToken} (the actual type is {@code OAuth2AuthenticationToken}).
 *
 * <ul>
 *   <li>{@code mode=link}: match existing account by email only; redirect with
 *       {@code error=email_mismatch} if none found (Settings "Connect Google" flow).</li>
 *   <li>Anything else ({@code mode=login} or absent): find existing account or create a new
 *       one (login / register flow from the auth pages).</li>
 * </ul>
 */
@Slf4j
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;

    /** Frontend origin; defaults to local dev, overridden via {@code FRONTEND_URL} env var in production. */
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    /**
     * Reads {@code mode} from the session attribute written by {@link OAuth2ModePreservingRepository},
     * resolves the local user accordingly, and redirects the browser.
     *
     * @param request        the HTTP request for the OAuth2 callback
     * @param response       the HTTP response used to perform the redirect
     * @param authentication the Spring Security authentication object carrying the OAuth2 principal
     * @throws IOException if the redirect fails
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String googleEmail = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String googleId = oauth2User.getAttribute("sub");

        // Read mode from the session attribute saved by OAuth2ModePreservingRepository.
        HttpSession session = request.getSession(false);
        String mode = (session != null)
                ? (String) session.getAttribute(OAuth2ModePreservingRepository.SESSION_KEY_MODE)
                : null;

        log.debug("OAuth2SuccessHandler: googleEmail='{}', mode='{}'", googleEmail, mode);

        User user;
        if ("link".equals(mode)) {
            String linkUserIdStr = (session != null)
                    ? (String) session.getAttribute(OAuth2ModePreservingRepository.SESSION_KEY_LINK_USER_ID)
                    : null;
            log.debug("OAuth2 link: linkUserId='{}' from session, googleEmail='{}'", linkUserIdStr, googleEmail);
            String encodedEmail = URLEncoder.encode(googleEmail, StandardCharsets.UTF_8);
            if (linkUserIdStr == null) {
                log.debug("OAuth2 link: no linkUserId in session, redirecting with email_mismatch");
                response.sendRedirect(frontendUrl + "/oauth2/callback?error=email_mismatch&googleEmail=" + encodedEmail);
                return;
            }
            user = userService.linkGoogleAccount(Long.parseLong(linkUserIdStr), googleId, googleEmail);
            if (user == null) {
                log.debug("OAuth2 link: email mismatch — userId={} email does not match googleEmail='{}'", linkUserIdStr, googleEmail);
                response.sendRedirect(frontendUrl + "/oauth2/callback?error=email_mismatch&googleEmail=" + encodedEmail);
                return;
            }
        } else {
            user = userService.findOrCreateOAuth2User(googleEmail, name, googleId);
        }

        String token = jwtService.generateToken(user);
        log.debug("OAuth2 success for {} (mode='{}'), issuing JWT and redirecting", googleEmail, mode);
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token + "&userId=" + user.getId());
    }
}
