package com.crm.integration.importjob.application.command;

import com.crm.integration.importjob.domain.ImportJobId;

public record UpdateImportProgressCommand(
		ImportJobId id,
		long version,
		long processedRows,
		long successRows,
		long errorRows
) {
}
