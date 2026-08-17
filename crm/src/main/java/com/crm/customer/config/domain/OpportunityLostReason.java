package com.crm.customer.config.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class OpportunityLostReason {

	private final TenantId tenantId;
	private final OpportunityLostReasonId id;
	private final String reasonCode;
	private String name;
	private String description;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public OpportunityLostReason(
			TenantId tenantId,
			OpportunityLostReasonId id,
			String reasonCode,
			String name,
			String description,
			boolean active,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.reasonCode = Objects.requireNonNull(reasonCode, "reasonCode must not be null").trim().toUpperCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static OpportunityLostReason create(
			TenantId tenantId,
			OpportunityLostReasonId id,
			String reasonCode,
			String name,
			String description,
			ActorId actorId,
			Instant now) {
		return new OpportunityLostReason(
				tenantId,
				id,
				reasonCode,
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

	public OpportunityLostReasonId id() {
		return id;
	}

	public String reasonCode() {
		return reasonCode;
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
