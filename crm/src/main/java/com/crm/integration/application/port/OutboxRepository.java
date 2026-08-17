package com.crm.integration.application.port;

import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.integration.application.query.OutboxSearchQuery;
import com.crm.integration.domain.OutboxEvent;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface OutboxRepository {

	PageResult<OutboxEventSummary> search(TenantId tenantId, OutboxSearchQuery query);

	void insert(OutboxEvent event);

}
