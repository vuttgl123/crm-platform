package com.crm.integration.importjob.application.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.crm.integration.importjob.domain.ImportJob;
import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.integration.importjob.domain.SourceType;

public record ImportJobDetails(
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

	public static ImportJobDetails from(ImportJob job) {
		return new ImportJobDetails(
				job.id().value(),
				job.jobType(),
				job.sourceType(),
				job.sourceReference(),
				job.targetEntityType(),
				job.status(),
				job.totalRows(),
				job.processedRows(),
				job.successRows(),
				job.errorRows(),
				job.mappingConfig(),
				job.errorReportReference(),
				job.startedAt(),
				job.completedAt(),
				job.requestedBy(),
				job.auditInfo().createdBy() != null ? job.auditInfo().createdBy().value() : null,
				job.auditInfo().createdAt(),
				job.auditInfo().updatedBy() != null ? job.auditInfo().updatedBy().value() : null,
				job.auditInfo().updatedAt(),
				job.version()
		);
	}

}
