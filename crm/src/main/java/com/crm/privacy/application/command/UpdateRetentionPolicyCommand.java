package com.crm.privacy.application.command;

import com.crm.privacy.domain.RetentionAction;
import com.crm.privacy.domain.RetentionPolicyId;

public record UpdateRetentionPolicyCommand(
		RetentionPolicyId id,
		long version,
		int retentionDays,
		RetentionAction actionOnExpiry,
		String legalBasis,
		boolean active
) {
}
