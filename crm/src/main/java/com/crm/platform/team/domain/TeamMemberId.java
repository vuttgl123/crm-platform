package com.crm.platform.team.domain;

import java.util.Objects;
import java.util.UUID;

public record TeamMemberId(TeamId teamId, UUID userId) {

	public TeamMemberId {
		Objects.requireNonNull(teamId, "teamId must not be null");
		Objects.requireNonNull(userId, "userId must not be null");
	}

	public static TeamMemberId of(TeamId teamId, UUID userId) {
		return new TeamMemberId(teamId, userId);
	}

}
