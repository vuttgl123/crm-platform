package com.crm.service.category.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record TicketCategoryResponse(
		UUID id,
		String categoryCode,
		String name,
		UUID parentCategoryId,
		UUID defaultTeamId,
		String description,
		boolean isActive,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
