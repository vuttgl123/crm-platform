package com.crm.platform.membership.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.platform.membership.domain.TenantMembershipStatus;
import com.crm.sharedkernel.domain.TenantId;

public record ApprovedMembershipDetails(
		TenantId tenantId,
		UserReference user,
		TenantMembershipStatus status,
		boolean tenantAdmin,
		Instant joinedAt,
		List<RoleReference> roles,
		long version) {

	public ApprovedMembershipDetails {
		Objects.requireNonNull(tenantId, "tenantId must not be null");
		Objects.requireNonNull(user, "user must not be null");
		Objects.requireNonNull(status, "status must not be null");
		Objects.requireNonNull(joinedAt, "joinedAt must not be null");
		roles = List.copyOf(Objects.requireNonNull(roles, "roles must not be null"));
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
