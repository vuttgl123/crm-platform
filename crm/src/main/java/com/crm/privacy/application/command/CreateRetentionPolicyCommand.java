package com.crm.privacy.application.command;

import com.crm.privacy.domain.RetentionAction;

public record CreateRetentionPolicyCommand(
		String entityType,
		String purpose,
		int retentionDays,
		RetentionAction actionOnExpiry,
		String legalBasis
) {
}
