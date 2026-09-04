package com.crm.platform.access.application.usecase;

import java.util.List;

import com.crm.platform.access.application.command.ChangeRoleStatusCommand;
import com.crm.platform.access.application.command.CloneRoleCommand;
import com.crm.platform.access.application.command.CompareRolesCommand;
import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.command.InstantiateRoleTemplateCommand;
import com.crm.platform.access.application.command.ReassignRoleMembersCommand;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.PermissionMatrixDto;
import com.crm.platform.access.application.dto.RoleComparisonResultDto;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleMemberSummaryDto;
import com.crm.platform.access.application.dto.RoleStatsDto;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.application.dto.RoleTemplateDto;
import com.crm.platform.access.domain.RoleId;

public interface RoleManagementFacade {

	List<PermissionCatalogueItem> permissions();

	List<RoleSummary> roles();

	RoleDetails get(RoleId roleId);

	RoleDetails create(CreateRoleCommand command);

	RoleDetails update(UpdateRoleCommand command);

	void delete(DeleteRoleCommand command);

	RoleStatsDto getStats();

	RoleDetails clone(CloneRoleCommand command);

	void changeStatus(ChangeRoleStatusCommand command);

	List<RoleMemberSummaryDto> getMembers(RoleId roleId);

	void reassignMembers(ReassignRoleMembersCommand command);

	RoleComparisonResultDto compare(CompareRolesCommand command);

	List<RoleTemplateDto> getTemplates();

	RoleDetails instantiateTemplate(InstantiateRoleTemplateCommand command);

	PermissionMatrixDto getPermissionMatrix();

}
