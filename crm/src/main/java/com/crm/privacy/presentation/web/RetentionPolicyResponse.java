package com.crm.privacy.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.RetentionAction;

public record RetentionPolicyResponse(
		UUID id,
		String entityType,
		String purpose,
		int retentionDays,
		RetentionAction actionOnExpiry,
		String legalBasis,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
