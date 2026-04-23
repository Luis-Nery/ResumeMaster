package com.luisnery.resumemaster.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * Extends the default OAuth2 authorization request resolver to capture the
 * {@code mode} query parameter ({@code ?mode=login} or {@code ?mode=link}) from the
 * initiation URL and embed it in the {@link OAuth2AuthorizationRequest} internal
 * {@code attributes} map (not sent to Google).
 *
 * <p>Storing {@code mode} inside the authorization request object — rather than in a
 * plain HTTP session attribute — ensures it survives Spring Security's session fixation
 * protection (which changes the session ID after authentication and can cause a separately
 * stored session attribute to be lost). Spring Security saves and restores the full
 * {@link OAuth2AuthorizationRequest} itself as part of the normal OAuth2 state-parameter
 * handshake, so the embedded attribute is always available in
 * {@link OAuth2SuccessHandler} via the {@code Authentication} object.
 */
@Slf4j
@Component
public class OAuth2ModeRequestResolver implements OAuth2AuthorizationRequestResolver {

    /** Key used to store {@code mode} in the {@link OAuth2AuthorizationRequest} attributes. */
    static final String ATTR_MODE = "mode";

    /** Key used to store the linking user's ID in the {@link OAuth2AuthorizationRequest} attributes. */
    static final String ATTR_LINK_USER_ID = "linkUserId";

    private static final String AUTHORIZATION_BASE_URI = "/oauth2/authorization";

    private final DefaultOAuth2AuthorizationRequestResolver delegate;

    public OAuth2ModeRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, AUTHORIZATION_BASE_URI);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authRequest = delegate.resolve(request);
        return embedMode(request, authRequest);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest authRequest = delegate.resolve(request, clientRegistrationId);
        return embedMode(request, authRequest);
    }

    /**
     * Copies {@code mode} from the HTTP query parameter into the authorization request's
     * internal {@code attributes} map so it travels with the request object through the flow.
     */
    private OAuth2AuthorizationRequest embedMode(HttpServletRequest request,
                                                 OAuth2AuthorizationRequest authRequest) {
        if (authRequest == null) return null;
        String mode = request.getParameter(ATTR_MODE);
        String linkUserId = request.getParameter(ATTR_LINK_USER_ID);
        log.debug("OAuth2ModeRequestResolver: mode='{}', linkUserId='{}' — embedding into authorization request attributes", mode, linkUserId);
        return OAuth2AuthorizationRequest.from(authRequest)
                .attributes(attrs -> {
                    if (mode != null) attrs.put(ATTR_MODE, mode);
                    if (linkUserId != null) attrs.put(ATTR_LINK_USER_ID, linkUserId);
                })
                .build();
    }
}
