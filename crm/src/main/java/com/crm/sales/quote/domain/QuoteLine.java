package com.crm.sales.quote.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class QuoteLine {

	private final UUID id;
	private final QuoteId quoteId;
	private int position;
	private final UUID productId;
	private final UUID priceBookItemId;
	private String skuSnapshot;
	private String productNameSnapshot;
	private String unitSnapshot;
	private String descriptionSnapshot;
	private BigDecimal quantity;
	private BigDecimal listUnitPrice;
	private BigDecimal salesUnitPrice;
	private BigDecimal discountPercent;
	private BigDecimal taxPercent;
	private BigDecimal lineSubtotal;
	private BigDecimal lineDiscount;
	private BigDecimal lineTax;
	private BigDecimal lineTotal;
	private final Instant createdAt;
	private Instant updatedAt;

	public QuoteLine(
			UUID id,
			QuoteId quoteId,
			int position,
			UUID productId,
			UUID priceBookItemId,
			String skuSnapshot,
			String productNameSnapshot,
			String unitSnapshot,
			String descriptionSnapshot,
			BigDecimal quantity,
			BigDecimal listUnitPrice,
			BigDecimal salesUnitPrice,
			BigDecimal discountPercent,
			BigDecimal taxPercent,
			BigDecimal lineSubtotal,
			BigDecimal lineDiscount,
			BigDecimal lineTax,
			BigDecimal lineTotal,
			Instant createdAt,
			Instant updatedAt) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.quoteId = Objects.requireNonNull(quoteId, "quoteId must not be null");
		this.position = position;
		this.productId = Objects.requireNonNull(productId, "productId must not be null");
		this.priceBookItemId = Objects.requireNonNull(priceBookItemId, "priceBookItemId must not be null");
		this.skuSnapshot = skuSnapshot != null ? skuSnapshot.trim() : "";
		this.productNameSnapshot = productNameSnapshot != null ? productNameSnapshot.trim() : "";
		this.unitSnapshot = unitSnapshot != null ? unitSnapshot.trim() : null;
		this.descriptionSnapshot = descriptionSnapshot != null ? descriptionSnapshot.trim() : null;
		this.quantity = quantity != null ? quantity : BigDecimal.ONE;
		this.listUnitPrice = listUnitPrice != null ? listUnitPrice : BigDecimal.ZERO;
		this.salesUnitPrice = salesUnitPrice != null ? salesUnitPrice : BigDecimal.ZERO;
		this.discountPercent = discountPercent != null ? discountPercent : BigDecimal.ZERO;
		this.taxPercent = taxPercent != null ? taxPercent : BigDecimal.ZERO;
		this.lineSubtotal = lineSubtotal != null ? lineSubtotal : BigDecimal.ZERO;
		this.lineDiscount = lineDiscount != null ? lineDiscount : BigDecimal.ZERO;
		this.lineTax = lineTax != null ? lineTax : BigDecimal.ZERO;
		this.lineTotal = lineTotal != null ? lineTotal : BigDecimal.ZERO;
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
	}

	public static QuoteLine calculate(
			UUID id,
			QuoteId quoteId,
			int position,
			UUID productId,
			UUID priceBookItemId,
			String skuSnapshot,
			String productNameSnapshot,
			String unitSnapshot,
			String descriptionSnapshot,
			BigDecimal quantity,
			BigDecimal listUnitPrice,
			BigDecimal salesUnitPrice,
			BigDecimal discountPercent,
			BigDecimal taxPercent,
			Instant now) {
		BigDecimal qty = (quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0) ? quantity : BigDecimal.ONE;
		BigDecimal unitPrice = (salesUnitPrice != null && salesUnitPrice.compareTo(BigDecimal.ZERO) >= 0) ? salesUnitPrice : BigDecimal.ZERO;
		BigDecimal discPct = (discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) >= 0 && discountPercent.compareTo(BigDecimal.valueOf(100)) <= 0) ? discountPercent : BigDecimal.ZERO;
		BigDecimal taxPct = (taxPercent != null && taxPercent.compareTo(BigDecimal.ZERO) >= 0 && taxPercent.compareTo(BigDecimal.valueOf(100)) <= 0) ? taxPercent : BigDecimal.ZERO;

		BigDecimal subtotal = qty.multiply(unitPrice).setScale(6, RoundingMode.HALF_UP);
		BigDecimal discount = subtotal.multiply(discPct).divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
		BigDecimal taxable = subtotal.subtract(discount);
		BigDecimal tax = taxable.multiply(taxPct).divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
		BigDecimal total = taxable.add(tax).setScale(6, RoundingMode.HALF_UP);

		return new QuoteLine(
				id != null ? id : UUID.randomUUID(),
				quoteId,
				position,
				productId,
				priceBookItemId,
				skuSnapshot,
				productNameSnapshot,
				unitSnapshot,
				descriptionSnapshot,
				qty,
				listUnitPrice != null ? listUnitPrice : unitPrice,
				unitPrice,
				discPct,
				taxPct,
				subtotal,
				discount,
				tax,
				total,
				now != null ? now : Instant.now(),
				now != null ? now : Instant.now()
		);
	}

	public UUID id() { return id; }
	public QuoteId quoteId() { return quoteId; }
	public int position() { return position; }
	public void setPosition(int position) { this.position = position; }
	public UUID productId() { return productId; }
	public UUID priceBookItemId() { return priceBookItemId; }
	public String skuSnapshot() { return skuSnapshot; }
	public String productNameSnapshot() { return productNameSnapshot; }
	public String unitSnapshot() { return unitSnapshot; }
	public String descriptionSnapshot() { return descriptionSnapshot; }
	public BigDecimal quantity() { return quantity; }
	public BigDecimal listUnitPrice() { return listUnitPrice; }
	public BigDecimal salesUnitPrice() { return salesUnitPrice; }
	public BigDecimal discountPercent() { return discountPercent; }
	public BigDecimal taxPercent() { return taxPercent; }
	public BigDecimal lineSubtotal() { return lineSubtotal; }
	public BigDecimal lineDiscount() { return lineDiscount; }
	public BigDecimal lineTax() { return lineTax; }
	public BigDecimal lineTotal() { return lineTotal; }
	public Instant createdAt() { return createdAt; }
	public Instant updatedAt() { return updatedAt; }
}
