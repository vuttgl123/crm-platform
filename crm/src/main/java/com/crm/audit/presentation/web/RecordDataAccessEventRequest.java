package com.crm.audit.presentation.web;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.crm.audit.domain.DataAccessType;

public record RecordDataAccessEventRequest(
		@NotBlank String entityType,
		UUID entityId,
		@NotNull DataAccessType accessType,
		String fieldsAccessed,
		String purpose,
		String legalBasis,
		UUID requestId,
		String sourceIp,
		String userAgent,
		String metadata
) {}
