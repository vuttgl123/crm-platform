package com.crm.service.category.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TicketCategory {

	private final TenantId tenantId;
	private final TicketCategoryId id;
	private String categoryCode;
	private String name;
	private TicketCategoryId parentCategoryId;
	private UUID defaultTeamId;
	private String description;
	private boolean isActive;
	private final AuditInfo auditInfo;
	private long version;

	public TicketCategory(TenantId tenantId, TicketCategoryId id, String categoryCode,
			String name, TicketCategoryId parentCategoryId, UUID defaultTeamId,
			String description, boolean isActive, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.categoryCode = Objects.requireNonNull(categoryCode, "categoryCode must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.parentCategoryId = parentCategoryId;
		this.defaultTeamId = defaultTeamId;
		this.description = description;
		this.isActive = isActive;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static TicketCategory create(TenantId tenantId, TicketCategoryId id,
			String categoryCode, String name, TicketCategoryId parentCategoryId,
			UUID defaultTeamId, String description, boolean isActive,
			ActorId actorId, Instant now) {
		return new TicketCategory(tenantId, id, categoryCode.trim().toUpperCase(),
				name.trim(), parentCategoryId, defaultTeamId, description, isActive,
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(String name, TicketCategoryId parentCategoryId,
			UUID defaultTeamId, String description, boolean isActive,
			ActorId actorId, Instant now) {
		if (parentCategoryId != null && parentCategoryId.equals(this.id)) {
			throw new IllegalArgumentException("Category cannot be its own parent");
		}
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.parentCategoryId = parentCategoryId;
		this.defaultTeamId = defaultTeamId;
		this.description = description;
		this.isActive = isActive;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TicketCategoryId id() {
		return id;
	}

	public String categoryCode() {
		return categoryCode;
	}

	public String name() {
		return name;
	}

	public TicketCategoryId parentCategoryId() {
		return parentCategoryId;
	}

	public UUID defaultTeamId() {
		return defaultTeamId;
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
