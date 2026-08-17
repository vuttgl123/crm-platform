package com.crm.platform.team.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.platform.team.application.command.CreateRoleDataScopeCommand;
import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.domain.RoleDataScopeId;

public interface RoleDataScopeFacade {

	RoleDataScopeDetails create(CreateRoleDataScopeCommand command);

	List<RoleDataScopeDetails> listByRole(UUID roleId);

	void delete(RoleDataScopeId id);

}
