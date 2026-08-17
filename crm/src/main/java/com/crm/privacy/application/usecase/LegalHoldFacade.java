package com.crm.privacy.application.usecase;

import java.util.List;

import com.crm.privacy.application.command.CreateLegalHoldCommand;
import com.crm.privacy.application.command.ReleaseLegalHoldCommand;
import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.domain.LegalHoldId;

public interface LegalHoldFacade {

	LegalHoldDetails create(CreateLegalHoldCommand command);

	LegalHoldDetails get(LegalHoldId id);

	List<LegalHoldDetails> list();

	LegalHoldDetails release(ReleaseLegalHoldCommand command);

}
