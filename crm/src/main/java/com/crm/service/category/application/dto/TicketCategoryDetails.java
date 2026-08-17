package com.crm.service.category.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.service.category.domain.TicketCategory;

public record TicketCategoryDetails(
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

	public static TicketCategoryDetails from(TicketCategory category) {
		return new TicketCategoryDetails(
				category.id().value(),
				category.categoryCode(),
				category.name(),
				category.parentCategoryId() != null ? category.parentCategoryId().value() : null,
				category.defaultTeamId(),
				category.description(),
				category.isActive(),
				category.auditInfo().createdBy() != null ? category.auditInfo().createdBy().value() : null,
				category.auditInfo().createdAt(),
				category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null,
				category.auditInfo().updatedAt(),
				category.version()
		);
	}

}
