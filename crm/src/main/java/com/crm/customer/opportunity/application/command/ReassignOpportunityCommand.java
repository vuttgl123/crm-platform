package com.crm.customer.opportunity.application.command;

import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityId;

public record ReassignOpportunityCommand(
		OpportunityId id,
		String ownerType,
		UUID ownerId,
		long expectedVersion
) {}
