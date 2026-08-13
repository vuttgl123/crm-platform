package com.crm.customer.accountrelationship.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.accountrelationship.domain.AccountRelationshipDirection;
import com.crm.customer.accountrelationship.domain.AccountRelationshipType;

public record AccountRelationshipDetails(
		UUID id,
		AccountReference account,
		AccountReference relatedAccount,
		AccountRelationshipDirection direction,
		AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		String description,
		Instant createdAt,
		UUID createdBy) {

	public AccountRelationshipDetails {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(account, "account must not be null");
		Objects.requireNonNull(relatedAccount,
				"relatedAccount must not be null");
		Objects.requireNonNull(direction, "direction must not be null");
		Objects.requireNonNull(relationshipType,
				"relationshipType must not be null");
		Objects.requireNonNull(createdAt, "createdAt must not be null");
	}

}
