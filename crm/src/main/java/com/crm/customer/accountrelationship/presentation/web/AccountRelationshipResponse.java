package com.crm.customer.accountrelationship.presentation.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.accountrelationship.domain.AccountRelationshipDirection;
import com.crm.customer.accountrelationship.domain.AccountRelationshipType;

public record AccountRelationshipResponse(
		UUID id,
		Account account,
		Account relatedAccount,
		AccountRelationshipDirection direction,
		AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		String description,
		Instant createdAt,
		UUID createdBy) {

	public record Account(
			UUID id,
			String accountNumber,
			String displayName) {
	}

}
