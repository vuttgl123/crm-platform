package com.crm.sales.quote.domain;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.regex.Pattern;

public record QuoteAmounts(
		String currencyCode,
		BigDecimal subtotal,
		BigDecimal discountTotal,
		BigDecimal taxTotal,
		BigDecimal shippingTotal,
		BigDecimal grandTotal) {

	private static final Pattern CURRENCY_CODE_PATTERN = Pattern.compile("^[A-Z]{3}$");

	public QuoteAmounts {
		Objects.requireNonNull(currencyCode, "Currency code must not be null");
		if (!CURRENCY_CODE_PATTERN.matcher(currencyCode).matches()) {
			throw new IllegalArgumentException("Currency code must be 3 uppercase letters");
		}
		subtotal = subtotal == null ? BigDecimal.ZERO : subtotal;
		discountTotal = discountTotal == null ? BigDecimal.ZERO : discountTotal;
		taxTotal = taxTotal == null ? BigDecimal.ZERO : taxTotal;
		shippingTotal = shippingTotal == null ? BigDecimal.ZERO : shippingTotal;
		grandTotal = grandTotal == null ? BigDecimal.ZERO : grandTotal;
	}

	public static QuoteAmounts create(String currencyCode, BigDecimal subtotal,
			BigDecimal discountTotal, BigDecimal taxTotal, BigDecimal shippingTotal) {
		BigDecimal s = subtotal == null ? BigDecimal.ZERO : subtotal;
		BigDecimal d = discountTotal == null ? BigDecimal.ZERO : discountTotal;
		BigDecimal t = taxTotal == null ? BigDecimal.ZERO : taxTotal;
		BigDecimal sh = shippingTotal == null ? BigDecimal.ZERO : shippingTotal;
		BigDecimal grand = s.subtract(d).add(t).add(sh);
		if (grand.compareTo(BigDecimal.ZERO) < 0) {
			grand = BigDecimal.ZERO;
		}
		return new QuoteAmounts(currencyCode, s, d, t, sh, grand);
	}

}
