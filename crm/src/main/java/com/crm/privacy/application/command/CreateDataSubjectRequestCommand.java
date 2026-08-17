package com.crm.privacy.application.command;

import java.time.Instant;
import java.util.UUID;

import com.crm.privacy.domain.DsrType;

public record CreateDataSubjectRequestCommand(
		String requestNumber,
		DsrType requestType,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		String requesterEmail,
		Instant dueAt,
		UUID assignedUserId,
		String verificationReference
) {
}
