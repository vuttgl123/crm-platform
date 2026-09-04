package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TransitionOpportunityStageRequest(
		@NotNull UUID stageId,
		@Min(0) @Max(100) Integer probabilityPercentage,
		@NotNull Long version
) {}
