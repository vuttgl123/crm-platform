package com.crm.integration.importjob.application.query;

import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.sharedkernel.application.PageQuery;

public record ImportJobSearchQuery(
		ImportJobStatus status,
		String targetEntityType,
		String jobType,
		PageQuery pageQuery
) {
}
