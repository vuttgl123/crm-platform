package com.crm.identity.infrastructure.web;

import com.crm.identity.application.IssuedTokens;

public record AccessTokenResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		UserResponse user) {

	public static AccessTokenResponse from(IssuedTokens tokens) {
		return new AccessTokenResponse(tokens.accessToken(), "Bearer", tokens.accessTokenTtl().toSeconds(), UserResponse.from(tokens.user()));
	}

}
