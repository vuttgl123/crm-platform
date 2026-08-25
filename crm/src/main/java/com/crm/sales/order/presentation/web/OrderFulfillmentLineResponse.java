package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderFulfillmentLineResponse(
		UUID id,
		UUID orderLineId,
		String lineName,
		String lineSku,
		BigDecimal quantity
) {}
