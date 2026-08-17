package com.crm.privacy.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.RetentionAction;
import com.crm.privacy.domain.RetentionPolicy;

public record RetentionPolicyDetails(
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

	public static RetentionPolicyDetails from(RetentionPolicy policy) {
		return new RetentionPolicyDetails(
				policy.id().value(),
				policy.entityType(),
				policy.purpose(),
				policy.retentionDays(),
				policy.actionOnExpiry(),
				policy.legalBasis(),
				policy.isActive(),
				policy.auditInfo().createdBy() != null ? policy.auditInfo().createdBy().value() : null,
				policy.auditInfo().createdAt(),
				policy.auditInfo().updatedBy() != null ? policy.auditInfo().updatedBy().value() : null,
				policy.auditInfo().updatedAt(),
				policy.version()
		);
	}

}
