package com.crm.privacy.application.command;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.ConsentChannel;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.LawfulBasis;

public record CaptureConsentCommand(
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
		Instant effectiveFrom,
		Instant expiresAt,
		String metadata
) {
}
