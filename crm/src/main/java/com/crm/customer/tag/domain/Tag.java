package com.crm.customer.tag.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Tag {

	private final TenantId tenantId;
	private final TagId id;
	private final String tagKey;
	private String name;
	private String description;
	private String colorHex;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public Tag(
			TenantId tenantId,
			TagId id,
			String tagKey,
			String name,
			String description,
			String colorHex,
			boolean active,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.tagKey = Objects.requireNonNull(tagKey, "tagKey must not be null").trim().toLowerCase();
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.colorHex = colorHex != null ? colorHex.trim().toUpperCase() : null;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static Tag create(
			TenantId tenantId,
			TagId id,
			String tagKey,
			String name,
			String description,
			String colorHex,
			ActorId actorId,
			Instant now) {
		return new Tag(
				tenantId,
				id,
				tagKey,
				name,
				description,
				colorHex,
				true,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(String name, String description, String colorHex, boolean active, ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		this.colorHex = colorHex != null ? colorHex.trim().toUpperCase() : null;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TagId id() {
		return id;
	}

	public String tagKey() {
		return tagKey;
	}

	public String name() {
		return name;
	}

	public String description() {
		return description;
	}

	public String colorHex() {
		return colorHex;
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
