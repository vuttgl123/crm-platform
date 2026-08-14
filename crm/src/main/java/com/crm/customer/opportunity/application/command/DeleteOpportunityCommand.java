package com.crm.customer.opportunity.application.command;

import com.crm.customer.opportunity.domain.OpportunityId;

public record DeleteOpportunityCommand(
		OpportunityId opportunityId,
		long expectedVersion) {
}
