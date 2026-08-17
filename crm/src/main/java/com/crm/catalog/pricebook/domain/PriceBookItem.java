package com.crm.catalog.pricebook.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.catalog.product.domain.ProductId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class PriceBookItem {

	private final TenantId tenantId;
	private final PriceBookItemId id;
	private final PriceBookId priceBookId;
	private final ProductId productId;
	private BigDecimal unitPrice;
	private int minimumQuantity;
	private LocalDate validFrom;
	private LocalDate validTo;
	private final AuditInfo auditInfo;
	private long version;

	public PriceBookItem(TenantId tenantId, PriceBookItemId id, PriceBookId priceBookId,
			ProductId productId, BigDecimal unitPrice, int minimumQuantity,
			LocalDate validFrom, LocalDate validTo, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.priceBookId = Objects.requireNonNull(priceBookId, "priceBookId must not be null");
		this.productId = Objects.requireNonNull(productId, "productId must not be null");
		this.unitPrice = Objects.requireNonNull(unitPrice, "unitPrice must not be null");
		this.minimumQuantity = Math.max(1, minimumQuantity);
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static PriceBookItem create(TenantId tenantId, PriceBookItemId id,
			PriceBookId priceBookId, ProductId productId, BigDecimal unitPrice,
			int minimumQuantity, LocalDate validFrom, LocalDate validTo,
			ActorId actorId, Instant now) {
		return new PriceBookItem(tenantId, id, priceBookId, productId, unitPrice,
				minimumQuantity, validFrom, validTo, AuditInfo.create(actorId, now), 1L);
	}

	public void updatePrice(BigDecimal unitPrice, int minimumQuantity,
			LocalDate validFrom, LocalDate validTo, ActorId actorId, Instant now) {
		this.unitPrice = Objects.requireNonNull(unitPrice, "unitPrice must not be null");
		this.minimumQuantity = Math.max(1, minimumQuantity);
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public PriceBookItemId id() {
		return id;
	}

	public PriceBookId priceBookId() {
		return priceBookId;
	}

	public ProductId productId() {
		return productId;
	}

	public BigDecimal unitPrice() {
		return unitPrice;
	}

	public int minimumQuantity() {
		return minimumQuantity;
	}

	public LocalDate validFrom() {
		return validFrom;
	}

	public LocalDate validTo() {
		return validTo;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
