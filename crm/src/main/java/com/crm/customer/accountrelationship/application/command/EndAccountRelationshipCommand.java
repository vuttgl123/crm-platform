package com.crm.customer.accountrelationship.application.command;

import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;

public record EndAccountRelationshipCommand(
		AccountId accountId,
		AccountRelationshipId relationshipId,
		LocalDate validTo) {

	public EndAccountRelationshipCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(relationshipId,
				"relationshipId must not be null");
		Objects.requireNonNull(validTo, "validTo must not be null");
	}

}
