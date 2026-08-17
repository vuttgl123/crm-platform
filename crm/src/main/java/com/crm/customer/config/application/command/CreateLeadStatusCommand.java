package com.crm.customer.config.application.command;

import com.crm.customer.config.domain.LeadStatusCategory;

public record CreateLeadStatusCommand(
		String statusCode,
		String name,
		LeadStatusCategory statusCategory,
		int displayOrder,
		boolean defaultStatus,
		boolean terminal
) {
}
