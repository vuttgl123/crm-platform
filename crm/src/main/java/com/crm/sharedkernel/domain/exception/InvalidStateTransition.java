package com.crm.sharedkernel.domain.exception;

public final class InvalidStateTransition extends DomainException {

	public InvalidStateTransition(ErrorCode errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

	public InvalidStateTransition(String errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

}
