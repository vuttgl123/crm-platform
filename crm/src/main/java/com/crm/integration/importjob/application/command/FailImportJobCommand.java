package com.crm.integration.importjob.application.command;

import com.crm.integration.importjob.domain.ImportJobId;

public record FailImportJobCommand(
		ImportJobId id,
		long version,
		String errorReportReference
) {
}
