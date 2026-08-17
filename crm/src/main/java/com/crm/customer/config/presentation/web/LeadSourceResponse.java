package com.crm.customer.config.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record LeadSourceResponse(
		UUID id,
		String sourceCode,
		String name,
		String description,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
