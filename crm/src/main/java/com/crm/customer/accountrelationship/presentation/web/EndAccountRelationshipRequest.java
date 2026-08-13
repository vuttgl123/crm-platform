package com.crm.customer.accountrelationship.presentation.web;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record EndAccountRelationshipRequest(
		@NotNull LocalDate validTo) {
}
