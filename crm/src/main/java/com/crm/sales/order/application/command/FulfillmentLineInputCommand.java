package com.crm.sales.order.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record FulfillmentLineInputCommand(
		UUID orderLineId,
		BigDecimal quantity
) {}
