package com.crm.customer.config.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.config.domain.LeadStatusCategory;

public record LeadStatusResponse(
		UUID id,
		String statusCode,
		String name,
		LeadStatusCategory statusCategory,
		int displayOrder,
		boolean defaultStatus,
		boolean terminal,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
