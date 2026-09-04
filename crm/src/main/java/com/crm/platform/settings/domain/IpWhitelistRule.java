package com.crm.platform.settings.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class IpWhitelistRule {

	private final TenantId tenantId;
	private final UUID id;
	private final String cidrBlock;
	private final String description;
	private final boolean active;
	private final Instant createdAt;
	private final ActorId createdBy;

	public IpWhitelistRule(
			TenantId tenantId,
			UUID id,
			String cidrBlock,
			String description,
			boolean active,
			Instant createdAt,
			ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.cidrBlock = Objects.requireNonNull(cidrBlock, "cidrBlock must not be null");
		this.description = description != null ? description : "";
		this.active = active;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public UUID id() {
		return id;
	}

	public String cidrBlock() {
		return cidrBlock;
	}

	public String description() {
		return description;
	}

	public boolean isActive() {
		return active;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}
}
