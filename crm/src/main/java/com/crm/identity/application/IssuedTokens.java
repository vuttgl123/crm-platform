package com.crm.identity.application;

import java.time.Duration;

import com.crm.identity.domain.UserAccount;

public record IssuedTokens(
		String accessToken,
		String refreshToken,
		Duration accessTokenTtl,
		UserAccount user) {
}
