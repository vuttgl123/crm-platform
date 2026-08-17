package com.crm.privacy.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.ConsentChannel;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.LawfulBasis;

public record ConsentResponse(
		UUID id,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		ConsentChannel channel,
		String purpose,
		LawfulBasis lawfulBasis,
		ConsentStatus consentStatus,
		String policyVersion,
		String source,
		String proofReference,
		Instant capturedAt,
		Instant effectiveFrom,
		Instant expiresAt,
		Instant withdrawnAt,
		UUID recordedBy,
		String metadata,
		Instant createdAt
) {
}
