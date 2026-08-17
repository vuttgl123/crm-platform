package com.crm.privacy.application.command;

import com.crm.privacy.domain.ConsentId;

public record WithdrawConsentCommand(
		ConsentId id
) {
}
