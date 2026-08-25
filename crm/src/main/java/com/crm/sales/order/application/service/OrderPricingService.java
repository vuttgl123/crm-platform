package com.crm.sales.order.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderLine;
import org.springframework.stereotype.Service;

@Service
public class OrderPricingService {

	private static final int SCALE = 6;
	private static final int DISPLAY_SCALE = 2;
	private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

	public record CalculatedOrderLines(
			List<OrderLine> lines,
			OrderAmounts amounts
	) {}

	public CalculatedOrderLines calculate(
			String currencyCode,
			List<OrderLine> inputLines,
			BigDecimal shippingTotal
	) {
		String currency = (currencyCode != null && !currencyCode.isBlank()) ? currencyCode : "USD";
		BigDecimal shipping = (shippingTotal != null && shippingTotal.compareTo(BigDecimal.ZERO) >= 0)
				? shippingTotal.setScale(SCALE, ROUNDING)
				: BigDecimal.ZERO.setScale(SCALE, ROUNDING);

		if (inputLines == null || inputLines.isEmpty()) {
			OrderAmounts zeroAmounts = OrderAmounts.create(currency, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, shipping);
			return new CalculatedOrderLines(List.of(), zeroAmounts);
		}

		List<OrderLine> calculatedLines = new ArrayList<>();
		BigDecimal totalSubtotal = BigDecimal.ZERO;
		BigDecimal totalDiscount = BigDecimal.ZERO;
		BigDecimal totalTax = BigDecimal.ZERO;

		int pos = 1;
		for (OrderLine line : inputLines) {
			BigDecimal qty = line.quantity() != null && line.quantity().compareTo(BigDecimal.ZERO) > 0
					? line.quantity()
					: BigDecimal.ONE;
			BigDecimal unitPrice = line.unitPrice() != null && line.unitPrice().compareTo(BigDecimal.ZERO) >= 0
					? line.unitPrice()
					: BigDecimal.ZERO;

			BigDecimal lineSubtotal = qty.multiply(unitPrice).setScale(SCALE, ROUNDING);

			BigDecimal discPercent = line.discountPercent() != null && line.discountPercent().compareTo(BigDecimal.ZERO) >= 0
					? line.discountPercent()
					: BigDecimal.ZERO;
			BigDecimal discAmount = line.discountAmount();
			if (discPercent.compareTo(BigDecimal.ZERO) > 0) {
				discAmount = lineSubtotal.multiply(discPercent).divide(BigDecimal.valueOf(100), SCALE, ROUNDING);
			} else if (discAmount == null || discAmount.compareTo(BigDecimal.ZERO) < 0) {
				discAmount = BigDecimal.ZERO;
			}
			if (discAmount.compareTo(lineSubtotal) > 0) {
				discAmount = lineSubtotal;
			}

			BigDecimal taxableBase = lineSubtotal.subtract(discAmount);

			BigDecimal taxPercent = line.taxPercent() != null && line.taxPercent().compareTo(BigDecimal.ZERO) >= 0
					? line.taxPercent()
					: BigDecimal.ZERO;
			BigDecimal taxAmount = line.taxAmount();
			if (taxPercent.compareTo(BigDecimal.ZERO) > 0) {
				taxAmount = taxableBase.multiply(taxPercent).divide(BigDecimal.valueOf(100), SCALE, ROUNDING);
			} else if (taxAmount == null || taxAmount.compareTo(BigDecimal.ZERO) < 0) {
				taxAmount = BigDecimal.ZERO;
			}

			BigDecimal lineTotal = taxableBase.add(taxAmount).setScale(SCALE, ROUNDING);

			OrderLine calculatedLine = new OrderLine(
					line.id(),
					pos++,
					line.productId(),
					line.quoteItemId(),
					line.skuSnapshot(),
					line.nameSnapshot(),
					line.descriptionSnapshot(),
					line.unitOfMeasureSnapshot(),
					qty,
					line.fulfilledQuantity(),
					unitPrice,
					discPercent,
					discAmount,
					taxPercent,
					taxAmount,
					lineTotal
			);
			calculatedLines.add(calculatedLine);

			totalSubtotal = totalSubtotal.add(lineSubtotal);
			totalDiscount = totalDiscount.add(discAmount);
			totalTax = totalTax.add(taxAmount);
		}

		OrderAmounts amounts = OrderAmounts.create(
				currency,
				totalSubtotal.setScale(DISPLAY_SCALE, ROUNDING),
				totalDiscount.setScale(DISPLAY_SCALE, ROUNDING),
				totalTax.setScale(DISPLAY_SCALE, ROUNDING),
				shipping.setScale(DISPLAY_SCALE, ROUNDING)
		);

		return new CalculatedOrderLines(calculatedLines, amounts);
	}

}
