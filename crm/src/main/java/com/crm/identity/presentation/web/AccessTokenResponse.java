package com.crm.identity.presentation.web;

public record AccessTokenResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		UserResponse user) {
}
