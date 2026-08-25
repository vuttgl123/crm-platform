package com.crm.sales.order.application.query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.order.domain.OrderStatus;
import com.crm.sharedkernel.application.PageQuery;

public record OrderSearchQuery(
		String search,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		OrderStatus status,
		List<OrderStatus> statuses,
		String ownerType,
		UUID ownerId,
		LocalDate fromDate,
		LocalDate toDate,
		String currencyCode,
		PageQuery pageQuery) {
}
