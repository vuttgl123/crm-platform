package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderAction;
import com.crm.sales.order.domain.OrderPricingMode;
import com.crm.sales.order.domain.OrderSourceType;
import com.crm.sales.order.domain.OrderStatus;

public record OrderSummaryResponse(
		UUID id,
		String orderNumber,
		OrderSourceType sourceType,
		OrderPricingMode pricingMode,
		OrderStatus status,
		OrderReferenceResponse account,
		OrderReferenceResponse opportunity,
		OrderReferenceResponse quote,
		OrderOwnerReferenceResponse owner,
		OrderAmountsResponse amounts,
		int lineCount,
		BigDecimal progressPercent,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		Instant updatedAt,
		long version,
		List<OrderAction> availableActions
) {}
