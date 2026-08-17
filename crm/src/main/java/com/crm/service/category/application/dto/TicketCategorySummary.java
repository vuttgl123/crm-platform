package com.crm.service.category.application.dto;

import java.time.Instant;
import java.util.UUID;

public record TicketCategorySummary(
		UUID id,
		String categoryCode,
		String name,
		UUID parentCategoryId,
		UUID defaultTeamId,
		String defaultTeamName,
		String description,
		boolean isActive,
		int ticketsCount,
		Instant updatedAt,
		long version
) {
}
