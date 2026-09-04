package com.crm.audit.application.command;

import java.util.UUID;
import com.crm.audit.domain.AuditAction;

public record RecordAuditEventCommand(
		String schemaName,
		String tableName,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		String changedFields,
		String oldValues,
		String newValues,
		UUID requestId,
		UUID correlationId,
		String sourceIp,
		String userAgent,
		String applicationName
) {}
