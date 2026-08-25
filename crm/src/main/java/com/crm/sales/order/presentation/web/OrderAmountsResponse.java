package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;

public record OrderAmountsResponse(
		String currencyCode,
		BigDecimal subtotal,
		BigDecimal discountTotal,
		BigDecimal taxTotal,
		BigDecimal shippingTotal,
		BigDecimal grandTotal
) {}
