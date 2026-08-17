package com.crm.integration.importjob.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.integration.importjob.domain.SourceType;

public record ImportJobSummary(
		UUID id,
		String jobType,
		SourceType sourceType,
		String targetEntityType,
		ImportJobStatus status,
		Long totalRows,
		long processedRows,
		long successRows,
		long errorRows,
		Instant startedAt,
		Instant completedAt,
		UUID requestedBy,
		Instant createdAt,
		long version
) {
}
