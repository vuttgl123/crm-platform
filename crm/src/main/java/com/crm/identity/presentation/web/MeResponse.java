package com.crm.identity.presentation.web;

import java.util.List;

import com.crm.identity.domain.TenantMembershipSummary;

public record MeResponse(
		UserResponse user,
		List<TenantMembershipSummary> tenants) {

	public MeResponse {
		tenants = List.copyOf(tenants);
	}

}
