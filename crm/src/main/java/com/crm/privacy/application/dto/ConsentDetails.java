package com.crm.privacy.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.Consent;
import com.crm.privacy.domain.ConsentChannel;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.LawfulBasis;

public record ConsentDetails(
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

	public static ConsentDetails from(Consent consent) {
		return new ConsentDetails(
				consent.id().value(),
				consent.accountId(),
				consent.contactId(),
				consent.leadId(),
				consent.channel(),
				consent.purpose(),
				consent.lawfulBasis(),
				consent.consentStatus(),
				consent.policyVersion(),
				consent.source(),
				consent.proofReference(),
				consent.capturedAt(),
				consent.effectiveFrom(),
				consent.expiresAt(),
				consent.withdrawnAt(),
				consent.recordedBy() != null ? consent.recordedBy().value() : null,
				consent.metadata(),
				consent.createdAt()
		);
	}

}
