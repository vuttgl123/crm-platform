package com.crm.platform.access.presentation.web;

import java.util.List;

import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.RoleScopeInput;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.RoleId;
import org.springframework.stereotype.Component;

@Component
public final class RoleWebMapper {

	public CreateRoleCommand toCreateCommand(CreateRoleRequest request) {
		return new CreateRoleCommand(
				request.roleCode(), request.name(), request.description(),
				request.permissionCodes(), scopeInputs(request.dataScopes()));
	}

	public UpdateRoleCommand toUpdateCommand(
			RoleId roleId, UpdateRoleRequest request) {
		return new UpdateRoleCommand(
				roleId, request.version(), request.name(), request.description(),
				request.status(), request.permissionCodes(),
				scopeInputs(request.dataScopes()));
	}

	public PermissionResponse toPermissionResponse(
			PermissionCatalogueItem item) {
		return new PermissionResponse(
				item.permissionCode(), item.description(),
				item.moduleCode(), item.riskLevel());
	}

	public RoleSummaryResponse toSummaryResponse(RoleSummary summary) {
		return new RoleSummaryResponse(
				summary.id(), summary.roleCode(), summary.name(),
				summary.description(), summary.system(), summary.status(),
				summary.permissionCount(), summary.dataScopeCount(),
				summary.updatedAt(), summary.version());
	}

	public RoleResponse toResponse(RoleDetails details) {
		return new RoleResponse(
				details.id(), details.roleCode(), details.name(),
				details.description(), details.system(), details.status(),
				details.permissionCodes(),
				details.dataScopes().stream()
						.map(scope -> new RoleResponse.DataScope(
								scope.entityType(), scope.type(), scope.teamId()))
						.toList(),
				details.createdAt(), details.updatedAt(), details.version());
	}

	private static List<RoleScopeInput> scopeInputs(
			List<RoleDataScopeRequest> scopes) {
		return scopes.stream()
				.map(scope -> new RoleScopeInput(
						scope.entityType(), scope.type(), scope.teamId()))
				.toList();
	}

}
