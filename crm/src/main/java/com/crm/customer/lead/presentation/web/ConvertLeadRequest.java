package com.crm.customer.lead.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ConvertLeadRequest(
		@NotNull @Positive Long version,
		UUID convertedAccountId,
		UUID convertedContactId,
		UUID convertedOpportunityId,
		UUID convertedStatusId) {
}
