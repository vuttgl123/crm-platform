package com.crm.privacy.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.DsrStatus;
import com.crm.privacy.domain.DsrType;

public record DataSubjectRequestSummary(
		UUID id,
		String requestNumber,
		DsrType requestType,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		String requesterEmail,
		DsrStatus status,
		Instant receivedAt,
		Instant dueAt,
		Instant completedAt,
		UUID assignedUserId,
		Instant updatedAt,
		long version
) {
}
