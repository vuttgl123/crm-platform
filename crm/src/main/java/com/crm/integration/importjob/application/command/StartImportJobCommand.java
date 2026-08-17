package com.crm.integration.importjob.application.command;

import com.crm.integration.importjob.domain.ImportJobId;

public record StartImportJobCommand(
		ImportJobId id,
		long version
) {
}
