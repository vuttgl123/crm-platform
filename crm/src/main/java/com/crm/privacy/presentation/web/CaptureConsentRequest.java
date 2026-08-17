package com.crm.privacy.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.crm.privacy.domain.ConsentChannel;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.LawfulBasis;

public record CaptureConsentRequest(
		UUID accountId,
		UUID contactId,
		UUID leadId,

		@NotNull(message = "Consent channel is required")
		ConsentChannel channel,

		@NotBlank(message = "Consent purpose must not be blank")
		@Size(max = 255, message = "Consent purpose must not exceed 255 characters")
		String purpose,

		@NotNull(message = "Lawful basis is required")
		LawfulBasis lawfulBasis,

		ConsentStatus consentStatus,

		@Size(max = 100, message = "Policy version must not exceed 100 characters")
		String policyVersion,

		@Size(max = 255, message = "Source must not exceed 255 characters")
		String source,

		@Size(max = 500, message = "Proof reference must not exceed 500 characters")
		String proofReference,

		Instant effectiveFrom,
		Instant expiresAt,
		String metadata
) {
}
