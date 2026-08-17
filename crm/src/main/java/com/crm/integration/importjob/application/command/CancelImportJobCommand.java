package com.crm.integration.importjob.application.command;

import com.crm.integration.importjob.domain.ImportJobId;

public record CancelImportJobCommand(
		ImportJobId id,
		long version
) {
}
