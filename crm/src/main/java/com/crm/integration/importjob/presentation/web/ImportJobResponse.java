package com.crm.integration.importjob.presentation.web;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.integration.importjob.domain.SourceType;

public record ImportJobResponse(
		UUID id,
		String jobType,
		SourceType sourceType,
		String sourceReference,
		String targetEntityType,
		ImportJobStatus status,
		Long totalRows,
		long processedRows,
		long successRows,
		long errorRows,
		Map<String, Object> mappingConfig,
		String errorReportReference,
		Instant startedAt,
		Instant completedAt,
		UUID requestedBy,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
