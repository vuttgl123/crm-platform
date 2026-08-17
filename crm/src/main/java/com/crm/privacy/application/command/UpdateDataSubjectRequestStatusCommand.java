package com.crm.privacy.application.command;

import java.util.UUID;

import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.privacy.domain.DsrStatus;

public record UpdateDataSubjectRequestStatusCommand(
		DataSubjectRequestId id,
		long version,
		DsrStatus status,
		UUID assignedUserId,
		String verificationReference,
		String resolutionSummary,
		String rejectionReason
) {
}
