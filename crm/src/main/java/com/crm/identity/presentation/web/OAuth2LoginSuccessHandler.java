package com.crm.identity.presentation.web;

import java.io.IOException;
import java.util.Locale;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.crm.foundation.security.CodedAccessDeniedException;
import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.identity.application.command.ExternalLoginCommand;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.application.usecase.AuthenticationFacade;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.ExternalProvider;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import com.crm.sharedkernel.domain.exception.DomainException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public final class OAuth2LoginSuccessHandler
		implements AuthenticationSuccessHandler {

	private final AuthenticationFacade authenticationFacade;
	private final RefreshTokenCookie refreshTokenCookie;
	private final OAuth2LoginFailureHandler failureHandler;
	private final CrmSecurityProperties properties;

	public OAuth2LoginSuccessHandler(AuthenticationFacade authenticationFacade,
			RefreshTokenCookie refreshTokenCookie,
			OAuth2LoginFailureHandler failureHandler,
			CrmSecurityProperties properties) {
		this.authenticationFacade = authenticationFacade;
		this.refreshTokenCookie = refreshTokenCookie;
		this.failureHandler = failureHandler;
		this.properties = properties;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		try {
			OAuth2AuthenticationToken oauthToken =
					(OAuth2AuthenticationToken) authentication;
			OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();
			ExternalProvider provider = provider(
					oauthToken.getAuthorizedClientRegistrationId());
			String email = firstNonBlank(oidcUser.getEmail(),
					oidcUser.getClaimAsString("preferred_username"));
			String displayName = firstNonBlank(oidcUser.getFullName(), email);
			boolean emailVerified = provider == ExternalProvider.MICROSOFT
					|| Boolean.TRUE.equals(
							oidcUser.getClaimAsBoolean("email_verified"));
			ExternalLoginCommand command = new ExternalLoginCommand(provider,
					requireText(oidcUser.getClaimAsString("iss")),
					requireText(oidcUser.getSubject()), requireText(email),
					emailVerified, requireText(displayName));
			IssuedTokens tokens = authenticationFacade.loginExternal(command,
					RequestMetadataFactory.from(request));
			refreshTokenCookie.write(response, tokens.refreshToken());
			invalidateSession(request);
			response.sendRedirect(properties.oauth2().successRedirectUri()
					.toASCIIString());
		}
		catch (RuntimeException exception) {
			invalidateSession(request);
			failureHandler.redirect(response, errorCode(exception));
		}
	}

	private static ExternalProvider provider(String registrationId) {
		return switch (registrationId.toLowerCase(Locale.ROOT)) {
			case "google" -> ExternalProvider.GOOGLE;
			case "microsoft" -> ExternalProvider.MICROSOFT;
			default -> throw new IllegalArgumentException(
					"Unsupported OAuth2 provider");
		};
	}

	private static String errorCode(RuntimeException exception) {
		if (exception instanceof CodedAuthenticationException codedException) {
			return codedException.errorCode().value();
		}
		if (exception instanceof CodedAccessDeniedException codedException) {
			return codedException.errorCode().value();
		}
		if (exception instanceof DomainException domainException) {
			return domainException.errorCode().value();
		}
		return AuthenticationErrorCode.OAUTH2_LOGIN_FAILED.value();
	}

	private static String firstNonBlank(String first, String second) {
		return first != null && !first.isBlank() ? first : second;
	}

	private static String requireText(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(
					"Required OIDC claim is missing");
		}
		return value;
	}

	private static void invalidateSession(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
	}

}
