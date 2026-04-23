package com.luisnery.resumemaster.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * Wraps {@link HttpSessionOAuth2AuthorizationRequestRepository} to extract the
 * {@code mode} attribute embedded by {@link OAuth2ModeRequestResolver} from the
 * {@link OAuth2AuthorizationRequest} at the moment Spring Security removes it
 * (inside {@code OAuth2LoginAuthenticationFilter.attemptAuthentication}), and
 * copies it into a plain session attribute.
 *
 * <p>This solves a timing problem: Spring removes the authorization request from
 * the session before calling the success handler, so the handler cannot access the
 * request's attributes through the authentication object (which by that point is an
 * {@code OAuth2AuthenticationToken}, not an {@code OAuth2LoginAuthenticationToken}).
 * By preserving the value here, the success handler can read it from the session
 * without any unsafe cast.
 */
@Slf4j
@Component
public class OAuth2ModePreservingRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    /** Session key for {@code mode}, written here and read by {@link OAuth2SuccessHandler}. */
    static final String SESSION_KEY_MODE = "oauth2_mode_preserved";

    /** Session key for the linking user's ID, written here and read by {@link OAuth2SuccessHandler}. */
    static final String SESSION_KEY_LINK_USER_ID = "oauth2_link_user_id_preserved";

    private final HttpSessionOAuth2AuthorizationRequestRepository delegate =
            new HttpSessionOAuth2AuthorizationRequestRepository();

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return delegate.loadAuthorizationRequest(request);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        delegate.saveAuthorizationRequest(authorizationRequest, request, response);
    }

    /**
     * Delegates removal to the standard repository, then copies the {@code mode}
     * attribute (if present) into a plain session attribute before the authorization
     * request object is discarded.
     */
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = delegate.removeAuthorizationRequest(request, response);
        if (authRequest != null) {
            String mode = authRequest.getAttribute(OAuth2ModeRequestResolver.ATTR_MODE);
            String linkUserId = authRequest.getAttribute(OAuth2ModeRequestResolver.ATTR_LINK_USER_ID);
            HttpSession session = request.getSession(true);
            log.debug("OAuth2ModePreservingRepository.removeAuthorizationRequest: mode='{}', linkUserId='{}', session id='{}'",
                    mode, linkUserId, session.getId());
            if (mode != null) {
                session.setAttribute(SESSION_KEY_MODE, mode);
            } else {
                session.removeAttribute(SESSION_KEY_MODE);
            }
            if (linkUserId != null) {
                session.setAttribute(SESSION_KEY_LINK_USER_ID, linkUserId);
            } else {
                session.removeAttribute(SESSION_KEY_LINK_USER_ID);
            }
        }
        return authRequest;
    }
}
