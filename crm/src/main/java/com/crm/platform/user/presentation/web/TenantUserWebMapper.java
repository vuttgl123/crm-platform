package com.crm.platform.user.presentation.web;

import java.util.UUID;

import com.crm.platform.user.application.command.ChangeUserStatusCommand;
import com.crm.platform.user.application.command.ProvisionTenantUserCommand;
import com.crm.platform.user.application.command.UpdateTenantUserCommand;
import com.crm.platform.user.application.command.UpdateUserRolesCommand;
import com.crm.platform.user.application.query.TenantUserSearchQuery;
import com.crm.platform.user.presentation.web.request.ChangeUserStatusRequest;
import com.crm.platform.user.presentation.web.request.ProvisionUserRequest;
import com.crm.platform.user.presentation.web.request.TenantUserSearchRequest;
import com.crm.platform.user.presentation.web.request.UpdateUserRequest;
import com.crm.platform.user.presentation.web.request.UpdateUserRolesRequest;
import com.crm.sharedkernel.application.PageQuery;
import org.springframework.stereotype.Component;

@Component
public class TenantUserWebMapper {

	public TenantUserSearchQuery toSearchQuery(TenantUserSearchRequest request) {
		return new TenantUserSearchQuery(
				request.query(),
				request.status(),
				request.roleId(),
				request.teamId(),
				PageQuery.of(request.resolvePage(), request.resolveSize())
		);
	}

	public ProvisionTenantUserCommand toProvisionCommand(ProvisionUserRequest request) {
		return new ProvisionTenantUserCommand(
				request.email(),
				request.displayName(),
				request.phone(),
				request.jobTitle(),
				request.employeeReference(),
				request.roleIds(),
				request.teamId(),
				request.isTenantAdmin(),
				request.sendInviteEmail()
		);
	}

	public UpdateTenantUserCommand toUpdateCommand(UUID userId, UpdateUserRequest request) {
		return new UpdateTenantUserCommand(
				userId,
				request.displayName(),
				request.phone(),
				request.jobTitle(),
				request.employeeReference(),
				request.primaryTeamId(),
				request.isTenantAdmin(),
				request.version()
		);
	}

	public UpdateUserRolesCommand toUpdateRolesCommand(UUID userId, UpdateUserRolesRequest request) {
		return new UpdateUserRolesCommand(userId, request.roleIds());
	}

	public ChangeUserStatusCommand toChangeStatusCommand(UUID userId, ChangeUserStatusRequest request) {
		return new ChangeUserStatusCommand(userId, request.status());
	}
}
