package com.crm.integration.importjob.presentation.web;

import com.crm.integration.importjob.domain.ImportJobStatus;
import com.crm.sharedkernel.application.PageQuery;

public record ImportJobSearchRequest(
		ImportJobStatus status,
		String targetEntityType,
		String jobType,
		Integer page,
		Integer size
) {

	public PageQuery toPageQuery() {
		int p = (page != null && page >= 0) ? page : 0;
		int s = (size != null && size > 0 && size <= PageQuery.MAX_SIZE) ? size : PageQuery.DEFAULT_SIZE;
		return new PageQuery(p, s);
	}

}
