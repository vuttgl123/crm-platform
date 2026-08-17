package com.crm.integration.application.usecase;

import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.integration.application.query.OutboxSearchQuery;
import com.crm.sharedkernel.application.PageResult;

public interface OutboxFacade {

	PageResult<OutboxEventSummary> search(OutboxSearchQuery query);

}
