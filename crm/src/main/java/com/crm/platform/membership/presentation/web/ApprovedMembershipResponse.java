package com.crm.platform.membership.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.platform.membership.domain.TenantMembershipStatus;

public record ApprovedMembershipResponse(
		UUID tenantId,
		User user,
		TenantMembershipStatus status,
		boolean tenantAdmin,
		Instant joinedAt,
		List<Role> roles,
		long version) {

	public record User(
			UUID id,
			String email,
			String displayName) {
	}

	public record Role(
			UUID id,
			String roleCode,
			String name) {
	}

}
