package com.crm.privacy.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.privacy.application.command.CaptureConsentCommand;
import com.crm.privacy.application.command.WithdrawConsentCommand;
import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.domain.ConsentId;

public interface ConsentFacade {

	ConsentDetails capture(CaptureConsentCommand command);

	ConsentDetails withdraw(WithdrawConsentCommand command);

	ConsentDetails get(ConsentId id);

	List<ConsentDetails> findByTarget(UUID accountId, UUID contactId, UUID leadId);

}
