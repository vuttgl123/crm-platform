package com.crm.sharedkernel.domain.exception;

public final class ResourceConflict extends DomainException {

	public ResourceConflict(ErrorCode errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

	public ResourceConflict(String errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

}
