package com.crm.sharedkernel.domain.exception;

import java.util.Objects;
import java.util.regex.Pattern;

public abstract class DomainException extends RuntimeException {

	private static final Pattern ERROR_CODE_PATTERN =
			Pattern.compile("[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*");

	private final ErrorCode errorCode;
	private final Object[] messageArguments;

	protected DomainException(ErrorCode errorCode, Object... messageArguments) {
		super(requireErrorCode(errorCode).value());
		this.errorCode = errorCode;
		this.messageArguments = messageArguments == null
				? new Object[0]
				: messageArguments.clone();
	}

	public final ErrorCode errorCode() {
		return errorCode;
	}

	public final Object[] messageArguments() {
		return messageArguments.clone();
	}

	private static ErrorCode requireErrorCode(ErrorCode errorCode) {
		ErrorCode required = Objects.requireNonNull(errorCode,
				"errorCode must not be null");
		if (required.value() == null
				|| !ERROR_CODE_PATTERN.matcher(required.value()).matches()) {
			throw new IllegalArgumentException(
					"errorCode value must use upper snake case");
		}
		if (required.messageKey() == null || required.messageKey().isBlank()) {
			throw new IllegalArgumentException("messageKey must not be blank");
		}
		return required;
	}

}
