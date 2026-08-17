package com.crm.customer.tag.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record TagResponse(
		UUID id,
		String tagKey,
		String name,
		String description,
		String colorHex,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
