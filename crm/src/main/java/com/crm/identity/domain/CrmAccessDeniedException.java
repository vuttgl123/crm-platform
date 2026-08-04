package com.crm.identity.domain;

import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.springframework.security.access.AccessDeniedException;

public final class CrmAccessDeniedException extends AccessDeniedException {

	private final ErrorCode errorCode;

	public CrmAccessDeniedException(ErrorCode errorCode) {
		super(Objects.requireNonNull(errorCode, "errorCode must not be null").value());
		this.errorCode = errorCode;
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

}
