package com.crm.privacy.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.LegalHold;

public record LegalHoldDetails(
		UUID id,
		String holdCode,
		String name,
		String entityType,
		UUID entityId,
		String scopeFilter,
		String reason,
		Instant effectiveFrom,
		Instant releasedAt,
		UUID releasedBy,
		Instant createdAt,
		UUID createdBy
) {

	public static LegalHoldDetails from(LegalHold hold) {
		return new LegalHoldDetails(
				hold.id().value(),
				hold.holdCode(),
				hold.name(),
				hold.entityType(),
				hold.entityId(),
				hold.scopeFilter(),
				hold.reason(),
				hold.effectiveFrom(),
				hold.releasedAt(),
				hold.releasedBy() != null ? hold.releasedBy().value() : null,
				hold.createdAt(),
				hold.createdBy() != null ? hold.createdBy().value() : null
		);
	}

}
