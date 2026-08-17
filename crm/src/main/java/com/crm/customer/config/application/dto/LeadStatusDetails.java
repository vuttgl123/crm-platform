package com.crm.customer.config.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.config.domain.LeadStatus;
import com.crm.customer.config.domain.LeadStatusCategory;

public record LeadStatusDetails(
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

	public static LeadStatusDetails from(LeadStatus status) {
		return new LeadStatusDetails(
				status.id().value(),
				status.statusCode(),
				status.name(),
				status.statusCategory(),
				status.displayOrder(),
				status.isDefaultStatus(),
				status.isTerminal(),
				status.isActive(),
				status.auditInfo().createdBy() != null ? status.auditInfo().createdBy().value() : null,
				status.auditInfo().createdAt(),
				status.auditInfo().updatedBy() != null ? status.auditInfo().updatedBy().value() : null,
				status.auditInfo().updatedAt(),
				status.version()
		);
	}

}
