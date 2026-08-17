package com.crm.customer.config.application.command;

import com.crm.customer.config.domain.LeadSourceId;

public record UpdateLeadSourceCommand(
		LeadSourceId id,
		long version,
		String name,
		String description,
		boolean active
) {
}
