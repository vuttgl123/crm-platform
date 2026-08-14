package com.crm.customer.opportunity.domain;

import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;

public record OpportunityOwner(
		AccountOwnerType type,
		UUID id) {

	public OpportunityOwner {
		Objects.requireNonNull(type, "Opportunity owner type must not be null");
		Objects.requireNonNull(id, "Opportunity owner id must not be null");
	}

	public static OpportunityOwner user(UUID userId) {
		return new OpportunityOwner(AccountOwnerType.USER, userId);
	}

	public static OpportunityOwner team(UUID teamId) {
		return new OpportunityOwner(AccountOwnerType.TEAM, teamId);
	}

}
