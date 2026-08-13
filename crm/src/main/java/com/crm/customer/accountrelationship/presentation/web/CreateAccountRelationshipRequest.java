package com.crm.customer.accountrelationship.presentation.web;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.crm.customer.accountrelationship.domain.AccountRelationshipType;

public record CreateAccountRelationshipRequest(
		@NotNull UUID relatedAccountId,
		@NotNull AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		@Size(max = 4000) String description) {
}
