package com.crm.identity.application.dto;

import java.util.List;

import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;

public record CurrentIdentity(
		UserAccount user,
		List<TenantMembershipSummary> tenants) {

	public CurrentIdentity {
		tenants = List.copyOf(tenants);
	}

}
