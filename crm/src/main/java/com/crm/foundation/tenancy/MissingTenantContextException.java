package com.crm.foundation.tenancy;

public final class MissingTenantContextException extends IllegalStateException {

	public MissingTenantContextException() {
		super("Tenant context is required for this operation");
	}

}
