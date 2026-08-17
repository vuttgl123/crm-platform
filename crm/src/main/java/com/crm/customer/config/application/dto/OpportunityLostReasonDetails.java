package com.crm.customer.config.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.config.domain.OpportunityLostReason;

public record OpportunityLostReasonDetails(
		UUID id,
		String reasonCode,
		String name,
		String description,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static OpportunityLostReasonDetails from(OpportunityLostReason reason) {
		return new OpportunityLostReasonDetails(
				reason.id().value(),
				reason.reasonCode(),
				reason.name(),
				reason.description(),
				reason.isActive(),
				reason.auditInfo().createdBy() != null ? reason.auditInfo().createdBy().value() : null,
				reason.auditInfo().createdAt(),
				reason.auditInfo().updatedBy() != null ? reason.auditInfo().updatedBy().value() : null,
				reason.auditInfo().updatedAt(),
				reason.version()
		);
	}

}
