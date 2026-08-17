package com.crm.customer.config.application.command;

import com.crm.customer.config.domain.LeadStatusCategory;
import com.crm.customer.config.domain.LeadStatusId;

public record UpdateLeadStatusCommand(
		LeadStatusId id,
		long version,
		String name,
		LeadStatusCategory statusCategory,
		int displayOrder,
		boolean defaultStatus,
		boolean terminal,
		boolean active
) {
}
