package com.crm.platform.team.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.SoftDeleteInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Team {

	private final TenantId tenantId;
	private final TeamId id;
	private String name;
	private String description;
	private TeamId parentTeamId;
	private UUID managerUserId;
	private TeamStatus status;
	private final AuditInfo auditInfo;
	private final SoftDeleteInfo softDeleteInfo;
	private long version;

	public Team(TenantId tenantId, TeamId id, String name, String description,
			TeamId parentTeamId, UUID managerUserId, TeamStatus status,
			AuditInfo auditInfo, SoftDeleteInfo softDeleteInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		if (parentTeamId != null && parentTeamId.equals(id)) {
			throw new IllegalArgumentException("Team cannot be its own parent");
		}
		this.parentTeamId = parentTeamId;
		this.managerUserId = managerUserId;
		this.status = status != null ? status : TeamStatus.ACTIVE;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.softDeleteInfo = softDeleteInfo != null ? softDeleteInfo : SoftDeleteInfo.active();
		this.version = version;
	}

	public static Team create(TenantId tenantId, TeamId id, String name,
			String description, TeamId parentTeamId, UUID managerUserId,
			ActorId actorId, Instant now) {
		return new Team(tenantId, id, name.trim(), description, parentTeamId,
				managerUserId, TeamStatus.ACTIVE, AuditInfo.create(actorId, now),
				SoftDeleteInfo.active(), 1L);
	}

	public void update(String name, String description, TeamId parentTeamId,
			UUID managerUserId, TeamStatus status, ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.description = description;
		if (parentTeamId != null && parentTeamId.equals(this.id)) {
			throw new IllegalArgumentException("Team cannot be its own parent");
		}
		this.parentTeamId = parentTeamId;
		this.managerUserId = managerUserId;
		this.status = status != null ? status : this.status;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void delete(ActorId actorId, Instant now) {
		this.softDeleteInfo.delete(actorId, now);
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public boolean isDeleted() {
		return softDeleteInfo.isDeleted();
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TeamId id() {
		return id;
	}

	public String name() {
		return name;
	}

	public String description() {
		return description;
	}

	public TeamId parentTeamId() {
		return parentTeamId;
	}

	public UUID managerUserId() {
		return managerUserId;
	}

	public TeamStatus status() {
		return status;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public SoftDeleteInfo softDeleteInfo() {
		return softDeleteInfo;
	}

	public long version() {
		return version;
	}

}
