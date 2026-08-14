package com.crm.customer.opportunity.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityAmount;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;

public record UpdateOpportunityCommand(
		OpportunityId opportunityId,
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
		long expectedVersion) {
}
