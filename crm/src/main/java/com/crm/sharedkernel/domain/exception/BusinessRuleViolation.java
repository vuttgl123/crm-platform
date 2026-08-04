package com.crm.sharedkernel.domain.exception;

public final class BusinessRuleViolation extends DomainException {

	public BusinessRuleViolation(ErrorCode errorCode, Object... messageArguments) {
		super(errorCode, messageArguments);
	}

}
