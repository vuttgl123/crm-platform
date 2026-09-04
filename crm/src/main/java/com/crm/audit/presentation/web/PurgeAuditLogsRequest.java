package com.crm.audit.presentation.web;

import java.time.Instant;
import jakarta.validation.constraints.NotNull;

public record PurgeAuditLogsRequest(
		@NotNull Instant olderThan,
		String logType
) {}
