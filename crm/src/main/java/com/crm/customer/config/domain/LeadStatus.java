package com.crm.customer.config.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class LeadStatus {

	private final TenantId tenantId;
	private final LeadStatusId id;
	private final String statusCode;
	private String name;
	private LeadStatusCategory statusCategory;
	private int displayOrder;
	private boolean defaultStatus;
	private boolean terminal;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public LeadStatus(
			TenantId tenantId,
			LeadStatusId id,
			String statusCode,
			String name,
			LeadStatusCategory statusCategory,
			int displayOrder,
			boolean defaultStatus,
			boolean terminal,
			boolean active,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.statusCode = Objects.requireNonNull(statusCode, "statusCode must not be null").trim().toUpperCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.statusCategory = statusCategory != null ? statusCategory : LeadStatusCategory.OPEN;
		this.displayOrder = displayOrder;
		this.defaultStatus = defaultStatus;
		this.terminal = terminal;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static LeadStatus create(
			TenantId tenantId,
			LeadStatusId id,
			String statusCode,
			String name,
			LeadStatusCategory statusCategory,
			int displayOrder,
			boolean defaultStatus,
			boolean terminal,
			ActorId actorId,
			Instant now) {
		return new LeadStatus(
				tenantId,
				id,
				statusCode,
				name,
				statusCategory,
				displayOrder,
				defaultStatus,
				terminal,
				true,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(
			String name,
			LeadStatusCategory statusCategory,
			int displayOrder,
			boolean defaultStatus,
			boolean terminal,
			boolean active,
			ActorId actorId,
			Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.statusCategory = statusCategory != null ? statusCategory : this.statusCategory;
		this.displayOrder = displayOrder;
		this.defaultStatus = defaultStatus;
		this.terminal = terminal;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public LeadStatusId id() {
		return id;
	}

	public String statusCode() {
		return statusCode;
	}

	public String name() {
		return name;
	}

	public LeadStatusCategory statusCategory() {
		return statusCategory;
	}

	public int displayOrder() {
		return displayOrder;
	}

	public boolean isDefaultStatus() {
		return defaultStatus;
	}

	public boolean isTerminal() {
		return terminal;
	}

	public boolean isActive() {
		return active;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
