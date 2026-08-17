package com.crm.service.category.application.command;

import java.util.UUID;

import com.crm.service.category.domain.TicketCategoryId;

public record UpdateTicketCategoryCommand(
		TicketCategoryId id,
		long version,
		String name,
		UUID parentCategoryId,
		UUID defaultTeamId,
		String description,
		Boolean isActive
) {
}
