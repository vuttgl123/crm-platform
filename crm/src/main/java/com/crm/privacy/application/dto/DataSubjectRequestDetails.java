package com.crm.privacy.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.DataSubjectRequest;
import com.crm.privacy.domain.DsrStatus;
import com.crm.privacy.domain.DsrType;

public record DataSubjectRequestDetails(
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
		String verificationReference,
		String resolutionSummary,
		String rejectionReason,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static DataSubjectRequestDetails from(DataSubjectRequest req) {
		return new DataSubjectRequestDetails(
				req.id().value(),
				req.requestNumber(),
				req.requestType(),
				req.accountId(),
				req.contactId(),
				req.leadId(),
				req.requesterEmail(),
				req.status(),
				req.receivedAt(),
				req.dueAt(),
				req.completedAt(),
				req.assignedUserId(),
				req.verificationReference(),
				req.resolutionSummary(),
				req.rejectionReason(),
				req.auditInfo().createdBy() != null ? req.auditInfo().createdBy().value() : null,
				req.auditInfo().createdAt(),
				req.auditInfo().updatedBy() != null ? req.auditInfo().updatedBy().value() : null,
				req.auditInfo().updatedAt(),
				req.version()
		);
	}

}
