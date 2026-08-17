package com.crm.catalog.category.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ProductCategory {

	private final TenantId tenantId;
	private final CategoryId id;
	private String categoryCode;
	private String name;
	private CategoryId parentCategoryId;
	private String description;
	private boolean isActive;
	private final AuditInfo auditInfo;
	private long version;

	public ProductCategory(TenantId tenantId, CategoryId id, String categoryCode,
			String name, CategoryId parentCategoryId, String description,
			boolean isActive, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.categoryCode = Objects.requireNonNull(categoryCode, "categoryCode must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.parentCategoryId = parentCategoryId;
		this.description = description;
		this.isActive = isActive;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static ProductCategory create(TenantId tenantId, CategoryId id,
			String categoryCode, String name, CategoryId parentCategoryId,
			String description, boolean isActive, ActorId actorId, Instant now) {
		return new ProductCategory(tenantId, id, categoryCode.trim().toUpperCase(),
				name.trim(), parentCategoryId, description, isActive,
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(String name, CategoryId parentCategoryId, String description,
			boolean isActive, ActorId actorId, Instant now) {
		if (parentCategoryId != null && parentCategoryId.equals(this.id)) {
			throw new IllegalArgumentException("Category cannot be its own parent");
		}
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.parentCategoryId = parentCategoryId;
		this.description = description;
		this.isActive = isActive;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public CategoryId id() {
		return id;
	}

	public String categoryCode() {
		return categoryCode;
	}

	public String name() {
		return name;
	}

	public CategoryId parentCategoryId() {
		return parentCategoryId;
	}

	public String description() {
		return description;
	}

	public boolean isActive() {
		return isActive;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
