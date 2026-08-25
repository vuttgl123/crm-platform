package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record FulfillmentLineInputRequest(
		@NotNull UUID orderLineId,
		@NotNull @DecimalMin("0.000001") BigDecimal quantity
) {}
