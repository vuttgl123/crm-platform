package com.crm.foundation.security;

import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.springframework.security.access.AccessDeniedException;

public final class CodedAccessDeniedException extends AccessDeniedException {

	private final ErrorCode errorCode;

	public CodedAccessDeniedException(ErrorCode errorCode) {
		super(Objects.requireNonNull(errorCode,
				"errorCode must not be null").value());
		this.errorCode = errorCode;
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

}
