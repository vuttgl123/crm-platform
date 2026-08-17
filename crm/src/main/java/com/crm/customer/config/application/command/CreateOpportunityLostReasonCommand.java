package com.crm.customer.config.application.command;

public record CreateOpportunityLostReasonCommand(
		String reasonCode,
		String name,
		String description
) {
}
