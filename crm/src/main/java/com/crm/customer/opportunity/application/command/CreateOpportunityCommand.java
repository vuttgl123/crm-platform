package com.crm.customer.opportunity.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityAmount;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.customer.opportunity.domain.OpportunityType;

public record CreateOpportunityCommand(
		String opportunityNumber,
		String name,
		UUID accountId,
		UUID pipelineId,
		UUID currentStageId,
		OpportunityOwner owner,
		UUID sourceId,
		UUID primaryContactId,
		OpportunityType opportunityType,
		OpportunityAmount amount,
		BigDecimal probability,
		LocalDate expectedCloseDate,
		String nextStep,
		String description,
		UUID campaignId) {
}
