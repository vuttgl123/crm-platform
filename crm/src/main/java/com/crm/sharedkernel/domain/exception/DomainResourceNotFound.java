package com.crm.sharedkernel.domain.exception;

public final class DomainResourceNotFound extends DomainException {

	public DomainResourceNotFound(ErrorCode errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

}
