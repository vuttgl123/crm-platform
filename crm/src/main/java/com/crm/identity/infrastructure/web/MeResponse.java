package com.crm.identity.infrastructure.web;

import java.util.List;

import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;

public record MeResponse(
		UserResponse user,
		List<TenantMembershipSummary> tenants) {

	public static MeResponse from(UserAccount user,
			List<TenantMembershipSummary> tenants) {
		return new MeResponse(UserResponse.from(user), List.copyOf(tenants));
	}

}
