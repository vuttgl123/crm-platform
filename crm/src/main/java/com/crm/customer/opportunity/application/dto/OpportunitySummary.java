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

public record OpportunitySummary(
		OpportunityId id,
		String opportunityNumber,
		String name,
		UUID accountId,
		UUID pipelineId,
		UUID currentStageId,
		OpportunityOwner owner,
		OpportunityType opportunityType,
		OpportunityStatus status,
		OpportunityAmount amount,
		BigDecimal probability,
		LocalDate expectedCloseDate,
		Instant updatedAt,
		long version) {
}
