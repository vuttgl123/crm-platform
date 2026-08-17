package com.crm.service.category.application.command;

import java.util.UUID;

public record CreateTicketCategoryCommand(
		String categoryCode,
		String name,
		UUID parentCategoryId,
		UUID defaultTeamId,
		String description,
		Boolean isActive
) {
}
