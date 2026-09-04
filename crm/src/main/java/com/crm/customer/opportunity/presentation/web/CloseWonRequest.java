package com.crm.customer.opportunity.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CloseWonRequest(
		@PositiveOrZero BigDecimal actualRevenueAmount,
		Instant closedDate,
		@NotNull Long version
) {}
