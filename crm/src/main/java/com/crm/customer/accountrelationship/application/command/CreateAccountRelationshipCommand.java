package com.crm.customer.accountrelationship.application.command;

import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.domain.AccountRelationshipType;

public record CreateAccountRelationshipCommand(
		AccountId accountId,
		AccountId relatedAccountId,
		AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		String description) {

	public CreateAccountRelationshipCommand {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(relatedAccountId,
				"relatedAccountId must not be null");
		Objects.requireNonNull(relationshipType,
				"relationshipType must not be null");
	}

}
