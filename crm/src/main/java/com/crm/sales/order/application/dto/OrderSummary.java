package com.crm.sales.order.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import com.crm.sales.order.domain.OrderAction;
import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderPricingMode;
import com.crm.sales.order.domain.OrderSourceType;
import com.crm.sales.order.domain.OrderStatus;

public record OrderSummary(
		OrderId id,
		String orderNumber,
		OrderSourceType sourceType,
		OrderPricingMode pricingMode,
		OrderStatus status,
		OrderReferenceDto account,
		OrderReferenceDto opportunity,
		OrderReferenceDto quote,
		OrderOwnerReferenceDto owner,
		OrderAmounts amounts,
		int lineCount,
		BigDecimal progressPercent,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		Instant updatedAt,
		long version,
		List<OrderAction> availableActions
) {}
