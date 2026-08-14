package com.crm.customer.opportunity.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityAmount;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record OpportunityDetails(
		TenantId tenantId,
		OpportunityId id,
		String opportunityNumber,
		String name,
		UUID accountId,
		UUID pipelineId,
		UUID currentStageId,
		OpportunityOwner owner,
		UUID sourceId,
		UUID primaryContactId,
		OpportunityType opportunityType,
		OpportunityStatus status,
		OpportunityAmount amount,
		BigDecimal probability,
		LocalDate expectedCloseDate,
		LocalDate actualCloseDate,
		String nextStep,
		String description,
		UUID lostReasonId,
		String lostReasonNotes,
		UUID campaignId,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
