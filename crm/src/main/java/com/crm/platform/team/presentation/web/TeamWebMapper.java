package com.crm.platform.team.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.platform.team.application.command.AddTeamMemberCommand;
import com.crm.platform.team.application.command.CreateTeamCommand;
import com.crm.platform.team.application.command.UpdateTeamCommand;
import com.crm.platform.team.application.dto.TeamDetails;
import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.domain.TeamId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TeamWebMapper {

	default CreateTeamCommand toCreateCommand(CreateTeamRequest request) {
		return new CreateTeamCommand(
				request.name(),
				request.description(),
				request.parentTeamId() != null ? new TeamId(request.parentTeamId()) : null,
				request.managerUserId()
		);
	}

	default UpdateTeamCommand toUpdateCommand(TeamId id, UpdateTeamRequest request) {
		return new UpdateTeamCommand(
				id,
				request.version(),
				request.name(),
				request.description(),
				request.parentTeamId() != null ? new TeamId(request.parentTeamId()) : null,
				request.managerUserId(),
				request.status()
		);
	}

	default AddTeamMemberCommand toAddMemberCommand(TeamId teamId, AddTeamMemberRequest request) {
		return new AddTeamMemberCommand(
				teamId,
				request.userId(),
				request.memberRole(),
				request.primary()
		);
	}

	TeamResponse toResponse(TeamDetails details);

	TeamSummaryResponse toSummaryResponse(TeamSummary summary);

	List<TeamSummaryResponse> toSummaryResponseList(List<TeamSummary> summaries);

	TeamMemberResponse toMemberResponse(TeamMemberDetails details);

	List<TeamMemberResponse> toMemberResponseList(List<TeamMemberDetails> members);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(TeamId value) {
		return value == null ? null : value.value();
	}

	default TeamId mapToTeamId(UUID value) {
		return value == null ? null : new TeamId(value);
	}

}
