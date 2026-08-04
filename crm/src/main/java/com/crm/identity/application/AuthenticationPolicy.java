package com.crm.identity.application;

import java.time.Duration;
import java.util.Objects;

public record AuthenticationPolicy(
		Duration accessTokenTtl,
		Duration refreshTokenTtl,
		boolean selfRegistrationEnabled,
		int maxFailedAttempts,
		Duration lockDuration) {

	public AuthenticationPolicy {
		Objects.requireNonNull(accessTokenTtl,
				"accessTokenTtl must not be null");
		Objects.requireNonNull(refreshTokenTtl,
				"refreshTokenTtl must not be null");
		Objects.requireNonNull(lockDuration,
				"lockDuration must not be null");
		if (maxFailedAttempts < 1) {
			throw new IllegalArgumentException(
					"maxFailedAttempts must be positive");
		}
	}

}
