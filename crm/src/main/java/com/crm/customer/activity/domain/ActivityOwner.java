package com.crm.customer.activity.domain;

import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;

public record ActivityOwner(UUID ownerUserId, UUID assignedTeamId) {

	public static ActivityOwner unassigned() {
		return new ActivityOwner(null, null);
	}

	public static ActivityOwner user(UUID userId) {
		Objects.requireNonNull(userId, "userId must not be null");
		return new ActivityOwner(userId, null);
	}

	public static ActivityOwner team(UUID teamId) {
		Objects.requireNonNull(teamId, "teamId must not be null");
		return new ActivityOwner(null, teamId);
	}

	public static ActivityOwner of(UUID userId, UUID teamId) {
		return new ActivityOwner(userId, teamId);
	}

	public static ActivityOwner forActor(ActorId actorId) {
		if (actorId == null) {
			return unassigned();
		}
		return user(actorId.value());
	}

	public boolean isAssigned() {
		return ownerUserId != null || assignedTeamId != null;
	}

}
