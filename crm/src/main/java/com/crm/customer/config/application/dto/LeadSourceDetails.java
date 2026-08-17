package com.crm.customer.config.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.config.domain.LeadSource;

public record LeadSourceDetails(
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

	public static LeadSourceDetails from(LeadSource source) {
		return new LeadSourceDetails(
				source.id().value(),
				source.sourceCode(),
				source.name(),
				source.description(),
				source.isActive(),
				source.auditInfo().createdBy() != null ? source.auditInfo().createdBy().value() : null,
				source.auditInfo().createdAt(),
				source.auditInfo().updatedBy() != null ? source.auditInfo().updatedBy().value() : null,
				source.auditInfo().updatedAt(),
				source.version()
		);
	}

}
