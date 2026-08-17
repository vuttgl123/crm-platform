package com.crm.service.category.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record TicketCategorySummaryResponse(
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
