package com.crm.platform.access.application.usecase;

import java.util.List;

import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.RoleId;

public interface RoleManagementFacade {

	List<PermissionCatalogueItem> permissions();

	List<RoleSummary> roles();

	RoleDetails get(RoleId roleId);

	RoleDetails create(CreateRoleCommand command);

	RoleDetails update(UpdateRoleCommand command);

	void delete(DeleteRoleCommand command);

}
