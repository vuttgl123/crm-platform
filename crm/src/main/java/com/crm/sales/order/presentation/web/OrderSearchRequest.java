package com.crm.sales.order.presentation.web;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderStatus;

public record OrderSearchRequest(
		String q,
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
		Integer page,
		Integer size
) {}
