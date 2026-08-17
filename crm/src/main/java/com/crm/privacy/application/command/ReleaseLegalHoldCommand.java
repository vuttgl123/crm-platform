package com.crm.privacy.application.command;

import com.crm.privacy.domain.LegalHoldId;

public record ReleaseLegalHoldCommand(
		LegalHoldId id
) {
}
