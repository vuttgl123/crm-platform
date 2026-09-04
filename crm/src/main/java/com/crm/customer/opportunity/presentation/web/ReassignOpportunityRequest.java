package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ReassignOpportunityRequest(
		@NotBlank @Pattern(regexp = "^(USER|TEAM)$") String ownerType,
		@NotNull UUID ownerId,
		@NotNull Long version
) {}
