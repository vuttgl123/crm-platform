package com.crm.platform.team.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class TeamMember {

	private final TenantId tenantId;
	private final TeamId teamId;
	private final UUID userId;
	private String memberRole;
	private boolean primary;
	private final Instant joinedAt;
	private Instant leftAt;
	private final Instant createdAt;
	private final ActorId createdBy;

	public TeamMember(TenantId tenantId, TeamId teamId, UUID userId, String memberRole,
			boolean primary, Instant joinedAt, Instant leftAt, Instant createdAt, ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.teamId = Objects.requireNonNull(teamId, "teamId must not be null");
		this.userId = Objects.requireNonNull(userId, "userId must not be null");
		this.memberRole = memberRole;
		this.primary = primary;
		this.joinedAt = joinedAt != null ? joinedAt : Instant.now();
		this.leftAt = leftAt;
		this.createdAt = createdAt != null ? createdAt : Instant.now();
		this.createdBy = createdBy;
	}

	public static TeamMember create(TenantId tenantId, TeamId teamId, UUID userId,
			String memberRole, boolean primary, ActorId actorId, Instant now) {
		return new TeamMember(tenantId, teamId, userId, memberRole, primary, now, null, now, actorId);
	}

	public void setPrimary(boolean primary) {
		this.primary = primary;
	}

	public void markLeft(Instant now) {
		this.leftAt = now;
		this.primary = false;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TeamId teamId() {
		return teamId;
	}

	public UUID userId() {
		return userId;
	}

	public String memberRole() {
		return memberRole;
	}

	public boolean isPrimary() {
		return primary;
	}

	public Instant joinedAt() {
		return joinedAt;
	}

	public Instant leftAt() {
		return leftAt;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

}
