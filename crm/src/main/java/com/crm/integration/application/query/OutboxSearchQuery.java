package com.crm.integration.application.query;

import java.util.UUID;

import com.crm.integration.domain.OutboxEventStatus;
import com.crm.sharedkernel.application.PageQuery;

public record OutboxSearchQuery(
		String aggregateType,
		UUID aggregateId,
		String eventType,
		OutboxEventStatus status,
		PageQuery page
) {

	public OutboxSearchQuery {
		if (page == null) {
			page = PageQuery.defaultPage();
		}
	}

}
