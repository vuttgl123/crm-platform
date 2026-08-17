package com.crm.customer.config.application.command;

public record CreateLeadSourceCommand(
		String sourceCode,
		String name,
		String description
) {
}
