package com.crm.sales.order.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderFulfillmentLineDto(
		UUID id,
		UUID orderLineId,
		String lineName,
		String lineSku,
		BigDecimal quantity
) {}
