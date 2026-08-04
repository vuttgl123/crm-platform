package com.crm.foundation.security;

public final class MissingActorContextException extends IllegalStateException {

	public MissingActorContextException() {
		super("Actor context is required for this operation");
	}

}
