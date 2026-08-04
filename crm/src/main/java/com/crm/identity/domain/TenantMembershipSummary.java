package com.crm.identity.domain;

import java.util.UUID;

public record TenantMembershipSummary(
		UUID tenantId,
		String tenantCode,
		String displayName,
		boolean tenantAdmin) {
}
