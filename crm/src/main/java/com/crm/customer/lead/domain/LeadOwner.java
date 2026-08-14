package com.crm.customer.lead.domain;

import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;

public record LeadOwner(
		AccountOwnerType type,
		UUID id) {

	public LeadOwner {
		Objects.requireNonNull(type, "Lead owner type must not be null");
		Objects.requireNonNull(id, "Lead owner id must not be null");
	}

	public static LeadOwner user(UUID userId) {
		return new LeadOwner(AccountOwnerType.USER, userId);
	}

	public static LeadOwner team(UUID teamId) {
		return new LeadOwner(AccountOwnerType.TEAM, teamId);
	}

}
