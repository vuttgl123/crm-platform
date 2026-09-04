package com.crm.audit.application.command;

import java.time.Instant;

public record PurgeAuditLogsCommand(
		Instant olderThan,
		String logType
) {}
