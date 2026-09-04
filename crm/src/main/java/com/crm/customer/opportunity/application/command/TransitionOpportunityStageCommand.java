package com.crm.customer.opportunity.application.command;

import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityId;

public record TransitionOpportunityStageCommand(
		OpportunityId id,
		UUID stageId,
		Integer probabilityPercentage,
		long expectedVersion
) {}
