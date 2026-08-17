package com.crm.customer.config.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class LeadSource {

	private final TenantId tenantId;
	private final LeadSourceId id;
	private final String sourceCode;
	private String name;
	private String description;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public LeadSource(
			TenantId tenantId,
			LeadSourceId id,
			String sourceCode,
			String name,
			String description,
			boolean active,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.sourceCode = Objects.requireNonNull(sourceCode, "sourceCode must not be null").trim().toUpperCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static LeadSource create(
			TenantId tenantId,
			LeadSourceId id,
			String sourceCode,
			String name,
			String description,
			ActorId actorId,
			Instant now) {
		return new LeadSource(
				tenantId,
				id,
				sourceCode,
				name,
				description,
				true,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(String name, String description, boolean active, ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public LeadSourceId id() {
		return id;
	}

	public String sourceCode() {
		return sourceCode;
	}

	public String name() {
		return name;
	}

	public String description() {
		return description;
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
