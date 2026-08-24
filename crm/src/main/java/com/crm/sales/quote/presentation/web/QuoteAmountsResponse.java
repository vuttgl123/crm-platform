package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;

public record QuoteAmountsResponse(
		String currencyCode,
		BigDecimal subtotal,
		BigDecimal discountTotal,
		BigDecimal taxTotal,
		BigDecimal shippingTotal,
		BigDecimal grandTotal
) {
}
