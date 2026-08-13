package com.crm.platform.membership.application.dto;

import java.util.Objects;

import com.crm.sharedkernel.domain.TenantId;

public record TenantReference(
		TenantId id,
		String tenantCode,
		String displayName) {

	public TenantReference {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(tenantCode, "tenantCode must not be null");
		Objects.requireNonNull(displayName, "displayName must not be null");
	}

}
