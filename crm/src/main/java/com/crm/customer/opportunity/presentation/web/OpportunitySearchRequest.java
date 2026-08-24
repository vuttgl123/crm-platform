package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;

public record OpportunitySearchRequest(
		String q,
		UUID accountId,
		UUID pipelineId,
		UUID stageId,
		OpportunityStatus status,
		OpportunityType opportunityType,
		AccountOwnerType ownerType,
		UUID ownerId,
		String forecastFrom,
		String forecastTo,
		String forecastCategory,
		String currencyCode,
		String forecastQuality,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
