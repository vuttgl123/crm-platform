package com.crm.platform.team.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.platform.team.application.command.CreateRoleDataScopeCommand;
import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.domain.RoleDataScopeId;
import com.crm.platform.team.domain.TeamId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RoleDataScopeWebMapper {

	default CreateRoleDataScopeCommand toCreateCommand(UUID roleId, CreateRoleDataScopeRequest request) {
		return new CreateRoleDataScopeCommand(
				roleId,
				request.entityType(),
				request.scopeType(),
				request.teamId() != null ? new TeamId(request.teamId()) : null
		);
	}

	RoleDataScopeResponse toResponse(RoleDataScopeDetails details);

	List<RoleDataScopeResponse> toResponseList(List<RoleDataScopeDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(RoleDataScopeId value) {
		return value == null ? null : value.value();
	}

	default RoleDataScopeId mapToRoleDataScopeId(UUID value) {
		return value == null ? null : new RoleDataScopeId(value);
	}

	default UUID map(TeamId value) {
		return value == null ? null : value.value();
	}

	default TeamId mapToTeamId(UUID value) {
		return value == null ? null : new TeamId(value);
	}

}
