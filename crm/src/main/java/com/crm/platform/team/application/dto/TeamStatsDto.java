package com.crm.platform.team.application.dto;

public record TeamStatsDto(
		long totalTeams,
		long activeTeams,
		long totalMembersAssigned,
		long unassignedMembersCount,
		long teamsWithManagersCount
) {}
