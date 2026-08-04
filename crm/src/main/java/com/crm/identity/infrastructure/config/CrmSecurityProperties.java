package com.crm.identity.infrastructure.config;

import java.net.URI;
import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

@ConfigurationProperties(prefix = "crm.security")
public record CrmSecurityProperties(
		String issuer,
		String audience,
		Duration accessTokenTtl,
		Duration refreshTokenTtl,
		boolean selfRegistrationEnabled,
		int maxFailedAttempts,
		Duration lockDuration,
		List<String> allowedOrigins,
		Jwt jwt,
		RefreshCookie refreshCookie,
		OAuth2 oauth2) {

	public record Jwt(
			Resource privateKeyLocation,
			Resource publicKeyLocation) {
	}

	public record RefreshCookie(
			String name,
			boolean secure,
			String sameSite) {
	}

	public record OAuth2(
			URI successRedirectUri,
			URI failureRedirectUri,
			Provider google,
			MicrosoftProvider microsoft) {
	}

	public record Provider(String clientId, String clientSecret) {

		public boolean configured() {
			return hasText(clientId) && hasText(clientSecret);
		}
	}

	public record MicrosoftProvider(
			String clientId,
			String clientSecret,
			String tenant) {

		public boolean configured() {
			return hasText(clientId) && hasText(clientSecret);
		}
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

}
