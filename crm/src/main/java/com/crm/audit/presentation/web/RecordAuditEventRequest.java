package com.crm.audit.presentation.web;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.crm.audit.domain.AuditAction;

public record RecordAuditEventRequest(
		@NotBlank String schemaName,
		@NotBlank String tableName,
		@NotBlank String aggregateType,
		UUID aggregateId,
		@NotNull AuditAction action,
		String changedFields,
		String oldValues,
		String newValues,
		UUID requestId,
		UUID correlationId,
		String sourceIp,
		String userAgent,
		String applicationName
) {}
