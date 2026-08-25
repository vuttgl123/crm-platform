package com.crm.sales.order.domain;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class OrderLine {

	private final UUID id;
	private int lineNumber;
	private UUID productId;
	private UUID quoteItemId;
	private String skuSnapshot;
	private String nameSnapshot;
	private String descriptionSnapshot;
	private String unitOfMeasureSnapshot;
	private BigDecimal quantity;
	private BigDecimal fulfilledQuantity;
	private BigDecimal unitPrice;
	private BigDecimal discountPercent;
	private BigDecimal discountAmount;
	private BigDecimal taxPercent;
	private BigDecimal taxAmount;
	private BigDecimal lineTotal;

	public OrderLine(
			UUID id,
			int lineNumber,
			UUID productId,
			UUID quoteItemId,
			String skuSnapshot,
			String nameSnapshot,
			String descriptionSnapshot,
			String unitOfMeasureSnapshot,
			BigDecimal quantity,
			BigDecimal fulfilledQuantity,
			BigDecimal unitPrice,
			BigDecimal discountPercent,
			BigDecimal discountAmount,
			BigDecimal taxPercent,
			BigDecimal taxAmount,
			BigDecimal lineTotal) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.lineNumber = lineNumber <= 0 ? 1 : lineNumber;
		this.productId = productId;
		this.quoteItemId = quoteItemId;
		this.skuSnapshot = trimToNull(skuSnapshot);
		this.nameSnapshot = Objects.requireNonNull(trimToNull(nameSnapshot), "nameSnapshot must not be blank");
		this.descriptionSnapshot = trimToNull(descriptionSnapshot);
		this.unitOfMeasureSnapshot = trimToNull(unitOfMeasureSnapshot);
		this.quantity = quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0 ? quantity : BigDecimal.ONE;
		this.fulfilledQuantity = fulfilledQuantity != null && fulfilledQuantity.compareTo(BigDecimal.ZERO) >= 0 ? fulfilledQuantity : BigDecimal.ZERO;
		this.unitPrice = unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) >= 0 ? unitPrice : BigDecimal.ZERO;
		this.discountPercent = discountPercent != null ? discountPercent : BigDecimal.ZERO;
		this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
		this.taxPercent = taxPercent != null ? taxPercent : BigDecimal.ZERO;
		this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
		this.lineTotal = lineTotal != null ? lineTotal : BigDecimal.ZERO;
	}

	public UUID id() { return id; }
	public int lineNumber() { return lineNumber; }
	public UUID productId() { return productId; }
	public UUID quoteItemId() { return quoteItemId; }
	public String skuSnapshot() { return skuSnapshot; }
	public String nameSnapshot() { return nameSnapshot; }
	public String descriptionSnapshot() { return descriptionSnapshot; }
	public String unitOfMeasureSnapshot() { return unitOfMeasureSnapshot; }
	public BigDecimal quantity() { return quantity; }
	public BigDecimal fulfilledQuantity() { return fulfilledQuantity; }
	public BigDecimal remainingQuantity() {
		BigDecimal remaining = quantity.subtract(fulfilledQuantity);
		return remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining;
	}
	public BigDecimal unitPrice() { return unitPrice; }
	public BigDecimal discountPercent() { return discountPercent; }
	public BigDecimal discountAmount() { return discountAmount; }
	public BigDecimal taxPercent() { return taxPercent; }
	public BigDecimal taxAmount() { return taxAmount; }
	public BigDecimal lineTotal() { return lineTotal; }

	public void setLineNumber(int lineNumber) {
		this.lineNumber = lineNumber;
	}

	public void setFulfilledQuantity(BigDecimal fulfilledQuantity) {
		this.fulfilledQuantity = fulfilledQuantity != null && fulfilledQuantity.compareTo(BigDecimal.ZERO) >= 0 ? fulfilledQuantity : BigDecimal.ZERO;
	}

	public void updateDraftDetails(
			UUID productId,
			String skuSnapshot,
			String nameSnapshot,
			String descriptionSnapshot,
			String unitOfMeasureSnapshot,
			BigDecimal quantity,
			BigDecimal unitPrice,
			BigDecimal discountPercent,
			BigDecimal discountAmount,
			BigDecimal taxPercent,
			BigDecimal taxAmount,
			BigDecimal lineTotal) {
		this.productId = productId;
		this.skuSnapshot = trimToNull(skuSnapshot);
		this.nameSnapshot = Objects.requireNonNull(trimToNull(nameSnapshot), "nameSnapshot must not be blank");
		this.descriptionSnapshot = trimToNull(descriptionSnapshot);
		this.unitOfMeasureSnapshot = trimToNull(unitOfMeasureSnapshot);
		this.quantity = quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0 ? quantity : BigDecimal.ONE;
		this.unitPrice = unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) >= 0 ? unitPrice : BigDecimal.ZERO;
		this.discountPercent = discountPercent != null ? discountPercent : BigDecimal.ZERO;
		this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
		this.taxPercent = taxPercent != null ? taxPercent : BigDecimal.ZERO;
		this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
		this.lineTotal = lineTotal != null ? lineTotal : BigDecimal.ZERO;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

}
