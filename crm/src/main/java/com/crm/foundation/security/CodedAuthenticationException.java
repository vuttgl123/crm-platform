package com.crm.foundation.security;

import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.springframework.security.core.AuthenticationException;

public final class CodedAuthenticationException
		extends AuthenticationException {

	private final ErrorCode errorCode;

	public CodedAuthenticationException(ErrorCode errorCode) {
		super(Objects.requireNonNull(errorCode,
				"errorCode must not be null").value());
		this.errorCode = errorCode;
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

}
