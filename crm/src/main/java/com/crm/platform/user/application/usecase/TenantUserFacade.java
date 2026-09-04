package com.crm.platform.user.application.usecase;

import java.util.UUID;

import com.crm.platform.user.application.command.ChangeUserStatusCommand;
import com.crm.platform.user.application.command.ProvisionTenantUserCommand;
import com.crm.platform.user.application.command.UpdateTenantUserCommand;
import com.crm.platform.user.application.command.UpdateUserRolesCommand;
import com.crm.platform.user.application.dto.TenantUserDetailsDto;
import com.crm.platform.user.application.dto.TenantUserStatsDto;
import com.crm.platform.user.application.dto.TenantUserSummaryDto;
import com.crm.platform.user.application.query.TenantUserSearchQuery;
import com.crm.sharedkernel.application.PageResult;

public interface TenantUserFacade {

	PageResult<TenantUserSummaryDto> search(TenantUserSearchQuery query);

	TenantUserDetailsDto getUser(UUID userId);

	TenantUserDetailsDto provisionUser(ProvisionTenantUserCommand command);

	TenantUserDetailsDto updateUser(UpdateTenantUserCommand command);

	void updateUserRoles(UpdateUserRolesCommand command);

	void changeUserStatus(ChangeUserStatusCommand command);

	void deleteUser(UUID userId);

	void resendInvite(UUID userId);

	void resetPassword(UUID userId);

	void revokeSessions(UUID userId);

	TenantUserStatsDto getStats();
}
