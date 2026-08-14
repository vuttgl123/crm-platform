package com.crm.customer.opportunity.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;

public record OpportunityResponse(
		UUID id,
		String opportunityNumber,
		String name,
		UUID accountId,
		UUID pipelineId,
		UUID currentStageId,
		Owner owner,
		UUID sourceId,
		UUID primaryContactId,
		OpportunityType opportunityType,
		OpportunityStatus status,
		Amount amount,
		BigDecimal probability,
		LocalDate expectedCloseDate,
		LocalDate actualCloseDate,
		String nextStep,
		String description,
		UUID lostReasonId,
		String lostReasonNotes,
		UUID campaignId,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Owner(
			AccountOwnerType type,
			UUID id) {
	}

	public record Amount(
			BigDecimal amount,
			String currencyCode) {
	}

}
