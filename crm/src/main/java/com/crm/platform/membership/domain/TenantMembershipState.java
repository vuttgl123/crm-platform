package com.crm.platform.membership.domain;

import java.util.Objects;

public record TenantMembershipState(
		TenantMembershipStatus status,
		long version) {

	public TenantMembershipState {
		Objects.requireNonNull(status, "status must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
