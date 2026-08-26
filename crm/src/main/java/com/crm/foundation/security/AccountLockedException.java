package com.crm.foundation.security;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.springframework.security.core.AuthenticationException;

/**
 * Raised when the supplied password is correct but the account is locked.
 *
 * This is never raised for a wrong password: an attacker guessing always
 * receives INVALID_CREDENTIALS and learns nothing about whether the account
 * exists or is locked.
 *
 * It extends Spring Security's AuthenticationException directly rather than
 * CodedAuthenticationException, which is declared final.
 */
public final class AccountLockedException extends AuthenticationException {

	private final ErrorCode errorCode;

	private final Instant lockedUntil;

	public AccountLockedException(ErrorCode errorCode, Instant lockedUntil) {
		super(Objects.requireNonNull(errorCode,
				"errorCode must not be null").value());
		this.errorCode = errorCode;
		this.lockedUntil = Objects.requireNonNull(lockedUntil,
				"lockedUntil must not be null");
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

	public Instant lockedUntil() {
		return lockedUntil;
	}

}
