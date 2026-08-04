package com.crm.identity.presentation.web;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public final class OAuth2LoginFailureHandler
		implements AuthenticationFailureHandler {

	private final CrmSecurityProperties properties;

	public OAuth2LoginFailureHandler(CrmSecurityProperties properties) {
		this.properties = properties;
	}

	@Override
	public void onAuthenticationFailure(HttpServletRequest request,
			HttpServletResponse response, AuthenticationException exception)
			throws IOException, ServletException {
		redirect(response,
				AuthenticationErrorCode.OAUTH2_LOGIN_FAILED.value());
	}

	public void redirect(HttpServletResponse response, String errorCode)
			throws IOException {
		String location = UriComponentsBuilder
				.fromUri(properties.oauth2().failureRedirectUri())
				.queryParam("errorCode", errorCode)
				.build()
				.encode()
				.toUriString();
		response.sendRedirect(location);
	}

}
