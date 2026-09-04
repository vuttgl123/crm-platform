package com.crm.audit.application.command;

import java.util.UUID;
import com.crm.audit.domain.DataAccessType;

public record RecordDataAccessEventCommand(
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		String fieldsAccessed,
		String purpose,
		String legalBasis,
		UUID requestId,
		String sourceIp,
		String userAgent,
		String metadata
) {}
