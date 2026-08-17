package com.crm.integration.importjob.application.command;

import com.crm.integration.importjob.domain.ImportJobId;

public record CompleteImportJobCommand(
		ImportJobId id,
		long version,
		long processedRows,
		long successRows,
		long errorRows,
		String errorReportReference
) {
}
