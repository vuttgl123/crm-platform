package com.crm.sales.order.application.query;

import java.util.UUID;

import com.crm.sales.order.domain.OrderStatus;
import com.crm.sharedkernel.application.PageQuery;

public record OrderSearchQuery(
		String search,
		UUID accountId,
		UUID opportunityId,
		UUID quoteId,
		OrderStatus status,
		UUID ownerUserId,
		PageQuery pageQuery) {
}
