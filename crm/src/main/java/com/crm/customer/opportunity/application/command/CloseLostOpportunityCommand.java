package com.crm.customer.opportunity.application.command;

import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityId;

public record CloseLostOpportunityCommand(
		OpportunityId id,
		UUID lostReasonId,
		String competitorNotes,
		long expectedVersion
) {}
