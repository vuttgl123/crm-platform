package com.crm.integration.importjob.application.command;

import java.util.Map;

import com.crm.integration.importjob.domain.SourceType;

public record CreateImportJobCommand(
		String jobType,
		SourceType sourceType,
		String sourceReference,
		String targetEntityType,
		Long totalRows,
		Map<String, Object> mappingConfig
) {
}
