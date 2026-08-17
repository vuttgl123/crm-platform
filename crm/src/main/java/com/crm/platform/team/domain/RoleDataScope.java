package com.crm.platform.team.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class RoleDataScope {

	private final TenantId tenantId;
	private final RoleDataScopeId id;
	private final UUID roleId;
	private final String entityType;
	private final DataScopeType scopeType;
	private final TeamId teamId;
	private final Instant createdAt;
	private final ActorId createdBy;

	public RoleDataScope(TenantId tenantId, RoleDataScopeId id, UUID roleId,
			String entityType, DataScopeType scopeType, TeamId teamId,
			Instant createdAt, ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.roleId = Objects.requireNonNull(roleId, "roleId must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null").trim().toUpperCase();
		this.scopeType = Objects.requireNonNull(scopeType, "scopeType must not be null");
		if ((scopeType == DataScopeType.OWN || scopeType == DataScopeType.TENANT) && teamId != null) {
			throw new IllegalArgumentException("teamId must be null for OWN or TENANT scopes");
		}
		if ((scopeType == DataScopeType.TEAM || scopeType == DataScopeType.TEAM_TREE) && teamId == null) {
			throw new IllegalArgumentException("teamId is required for TEAM or TEAM_TREE scopes");
		}
		this.teamId = teamId;
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.createdBy = createdBy;
	}

	public static RoleDataScope create(TenantId tenantId, RoleDataScopeId id, UUID roleId,
			String entityType, DataScopeType scopeType, TeamId teamId,
			ActorId actorId, Instant now) {
		return new RoleDataScope(tenantId, id, roleId, entityType, scopeType, teamId, now, actorId);
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public RoleDataScopeId id() {
		return id;
	}

	public UUID roleId() {
		return roleId;
	}

	public String entityType() {
		return entityType;
	}

	public DataScopeType scopeType() {
		return scopeType;
	}

	public TeamId teamId() {
		return teamId;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

}
