package com.crm.customer.config.application.command;

import com.crm.customer.config.domain.OpportunityLostReasonId;

public record UpdateOpportunityLostReasonCommand(
		OpportunityLostReasonId id,
		long version,
		String name,
		String description,
		boolean active
) {
}
