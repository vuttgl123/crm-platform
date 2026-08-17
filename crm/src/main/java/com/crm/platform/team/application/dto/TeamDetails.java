package com.crm.platform.team.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamStatus;

public record TeamDetails(
		UUID id,
		String name,
		String description,
		UUID parentTeamId,
		UUID managerUserId,
		TeamStatus status,
		List<TeamMemberDetails> members,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static TeamDetails from(Team team, List<TeamMemberDetails> members) {
		return new TeamDetails(
				team.id().value(),
				team.name(),
				team.description(),
				team.parentTeamId() != null ? team.parentTeamId().value() : null,
				team.managerUserId(),
				team.status(),
				members != null ? members : List.of(),
				team.auditInfo().createdBy() != null ? team.auditInfo().createdBy().value() : null,
				team.auditInfo().createdAt(),
				team.auditInfo().updatedBy() != null ? team.auditInfo().updatedBy().value() : null,
				team.auditInfo().updatedAt(),
				team.version()
		);
	}

}
