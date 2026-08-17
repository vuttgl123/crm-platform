package com.crm.catalog.product.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.catalog.category.domain.CategoryId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Product {

	private final TenantId tenantId;
	private final ProductId id;
	private String sku;
	private String name;
	private String description;
	private CategoryId categoryId;
	private ProductType productType;
	private String unitOfMeasure;
	private String taxCategory;
	private BigDecimal standardCost;
	private String costCurrencyCode;
	private boolean isActive;
	private String metadata;
	private final AuditInfo auditInfo;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	public Product(TenantId tenantId, ProductId id, String sku, String name,
			String description, CategoryId categoryId, ProductType productType,
			String unitOfMeasure, String taxCategory, BigDecimal standardCost,
			String costCurrencyCode, boolean isActive, String metadata,
			AuditInfo auditInfo, Instant deletedAt, ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.sku = Objects.requireNonNull(sku, "sku must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.description = description;
		this.categoryId = categoryId;
		this.productType = productType != null ? productType : ProductType.PRODUCT;
		this.unitOfMeasure = unitOfMeasure != null ? unitOfMeasure : "EA";
		this.taxCategory = taxCategory;
		this.standardCost = standardCost;
		this.costCurrencyCode = costCurrencyCode;
		this.isActive = isActive;
		this.metadata = metadata != null ? metadata : "{}";
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.version = version;
	}

	public static Product create(TenantId tenantId, ProductId id, String sku,
			String name, String description, CategoryId categoryId, ProductType productType,
			String unitOfMeasure, String taxCategory, BigDecimal standardCost,
			String costCurrencyCode, boolean isActive, String metadata,
			ActorId actorId, Instant now) {
		return new Product(tenantId, id, sku.trim().toUpperCase(), name.trim(),
				description, categoryId, productType, unitOfMeasure, taxCategory,
				standardCost, costCurrencyCode, isActive, metadata,
				AuditInfo.create(actorId, now), null, null, 1L);
	}

	public void update(String name, String description, CategoryId categoryId,
			ProductType productType, String unitOfMeasure, String taxCategory,
			BigDecimal standardCost, String costCurrencyCode, boolean isActive,
			String metadata, ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.categoryId = categoryId;
		this.productType = productType != null ? productType : this.productType;
		this.unitOfMeasure = unitOfMeasure != null ? unitOfMeasure : this.unitOfMeasure;
		this.taxCategory = taxCategory;
		this.standardCost = standardCost;
		this.costCurrencyCode = costCurrencyCode;
		this.isActive = isActive;
		this.metadata = metadata != null ? metadata : this.metadata;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void markDeleted(ActorId actorId, Instant now) {
		this.deletedAt = now;
		this.deletedBy = actorId;
		this.isActive = false;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ProductId id() {
		return id;
	}

	public String sku() {
		return sku;
	}

	public String name() {
		return name;
	}

	public String description() {
		return description;
	}

	public CategoryId categoryId() {
		return categoryId;
	}

	public ProductType productType() {
		return productType;
	}

	public String unitOfMeasure() {
		return unitOfMeasure;
	}

	public String taxCategory() {
		return taxCategory;
	}

	public BigDecimal standardCost() {
		return standardCost;
	}

	public String costCurrencyCode() {
		return costCurrencyCode;
	}

	public boolean isActive() {
		return isActive;
	}

	public String metadata() {
		return metadata;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public Instant deletedAt() {
		return deletedAt;
	}

	public ActorId deletedBy() {
		return deletedBy;
	}

	public long version() {
		return version;
	}

}
