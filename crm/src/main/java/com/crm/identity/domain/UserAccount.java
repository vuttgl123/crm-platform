package com.crm.identity.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record UserAccount(
		UUID id,
		String email,
		String displayName,
		UserStatus status,
		String passwordHash,
		int failedLoginAttempts,
		Instant lockedUntil,
		Instant emailVerifiedAt) {

	public UserAccount {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(email, "email must not be null");
		Objects.requireNonNull(displayName, "displayName must not be null");
		Objects.requireNonNull(status, "status must not be null");
	}

	public boolean permitsAuthentication() {
		return status == UserStatus.ACTIVE;
	}

	public boolean isTemporaryCredentialLockActiveAt(Instant now) {
		Objects.requireNonNull(now, "now must not be null");
		return lockedUntil != null && lockedUntil.isAfter(now);
	}

	public boolean permitsPasswordAuthenticationAt(Instant now) {
		return permitsAuthentication()
				&& !isTemporaryCredentialLockActiveAt(now);
	}

}
