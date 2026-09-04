package com.crm.platform.user.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.user.application.command.ChangeUserStatusCommand;
import com.crm.platform.user.application.command.ProvisionTenantUserCommand;
import com.crm.platform.user.application.command.UpdateTenantUserCommand;
import com.crm.platform.user.application.command.UpdateUserRolesCommand;
import com.crm.platform.user.application.dto.TenantUserDetailsDto;
import com.crm.platform.user.application.dto.TenantUserStatsDto;
import com.crm.platform.user.application.dto.TenantUserSummaryDto;
import com.crm.platform.user.application.port.TenantUserRepository;
import com.crm.platform.user.application.query.TenantUserSearchQuery;
import com.crm.platform.user.application.usecase.TenantUserFacade;
import com.crm.platform.user.domain.PlatformUser;
import com.crm.platform.user.domain.PlatformUserErrorCode;
import com.crm.platform.user.domain.PlatformUserStatus;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantUserApplicationService implements TenantUserFacade {

	private final TenantUserRepository userRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final PermissionChecker permissionChecker;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TenantUserApplicationService(
			TenantUserRepository userRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			PermissionChecker permissionChecker,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.userRepository = userRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.permissionChecker = permissionChecker;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<TenantUserSummaryDto> search(TenantUserSearchQuery query) {
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_READ);
		return userRepository.search(ctx.tenantId(), query);
	}

	@Override
	@Transactional(readOnly = true)
	public TenantUserDetailsDto getUser(UUID userId) {
		Objects.requireNonNull(userId, "userId must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_READ);
		return userRepository.findDetailsById(ctx.tenantId(), userId)
				.orElseThrow(() -> new DomainResourceNotFound(PlatformUserErrorCode.USER_NOT_FOUND));
	}

	@Override
	@Transactional
	public TenantUserDetailsDto provisionUser(ProvisionTenantUserCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_MANAGE);
		Instant now = timeProvider.now();

		UUID userId = userRepository.findUserIdByEmail(command.email())
				.orElseGet(() -> {
					String defaultPassHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"; // Temporary default password hash
					return userRepository.insertUser(command.email(), defaultPassHash, command.displayName(), command.phone(), ctx.actorId(), now);
				});

		userRepository.insertMembership(ctx.tenantId(), userId, command.employeeReference(), command.jobTitle(), command.isTenantAdmin(), ctx.actorId(), now);

		if (command.roleIds() != null && !command.roleIds().isEmpty()) {
			userRepository.replaceUserRoles(ctx.tenantId(), userId, command.roleIds(), ctx.actorId(), now);
		}

		if (command.teamId() != null) {
			userRepository.replacePrimaryTeam(ctx.tenantId(), userId, command.teamId(), ctx.actorId(), now);
		}

		return userRepository.findDetailsById(ctx.tenantId(), userId)
				.orElseThrow(() -> new IllegalStateException("Newly provisioned tenant user must exist"));
	}

	@Override
	@Transactional
	public TenantUserDetailsDto updateUser(UpdateTenantUserCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_MANAGE);
		Instant now = timeProvider.now();

		PlatformUser user = userRepository.findByIdForUpdate(ctx.tenantId(), command.userId())
				.orElseThrow(() -> new DomainResourceNotFound(PlatformUserErrorCode.USER_NOT_FOUND));

		long expectedVersion = command.version();
		user.updateProfile(command.displayName(), command.phone(), command.jobTitle(), command.employeeReference(), command.isTenantAdmin(), ctx.actorId(), now);

		if (userRepository.updateMembership(user, expectedVersion) != 1) {
			throw new ResourceConflict(PlatformUserErrorCode.USER_VERSION_CONFLICT);
		}

		if (command.primaryTeamId() != null) {
			userRepository.replacePrimaryTeam(ctx.tenantId(), command.userId(), command.primaryTeamId(), ctx.actorId(), now);
		}

		return userRepository.findDetailsById(ctx.tenantId(), command.userId())
				.orElseThrow(() -> new IllegalStateException("Updated tenant user must exist"));
	}

	@Override
	@Transactional
	public void updateUserRoles(UpdateUserRolesCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_ROLE_ASSIGN);
		Instant now = timeProvider.now();

		userRepository.findByIdForUpdate(ctx.tenantId(), command.userId())
				.orElseThrow(() -> new DomainResourceNotFound(PlatformUserErrorCode.USER_NOT_FOUND));

		userRepository.replaceUserRoles(ctx.tenantId(), command.userId(), command.roleIds(), ctx.actorId(), now);
	}

	@Override
	@Transactional
	public void changeUserStatus(ChangeUserStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_MANAGE);
		Instant now = timeProvider.now();

		if (command.userId().equals(ctx.actorId().value()) && command.status() != PlatformUserStatus.ACTIVE) {
			throw new BusinessRuleViolation(PlatformUserErrorCode.CANNOT_SUSPEND_SELF);
		}

		PlatformUser user = userRepository.findByIdForUpdate(ctx.tenantId(), command.userId())
				.orElseThrow(() -> new DomainResourceNotFound(PlatformUserErrorCode.USER_NOT_FOUND));

		long expectedVersion = user.version();
		user.changeStatus(command.status(), ctx.actorId(), now);

		if (userRepository.updateMembership(user, expectedVersion) != 1) {
			throw new ResourceConflict(PlatformUserErrorCode.USER_VERSION_CONFLICT);
		}
	}

	@Override
	@Transactional
	public void deleteUser(UUID userId) {
		Objects.requireNonNull(userId, "userId must not be null");
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_MANAGE);
		Instant now = timeProvider.now();

		if (userId.equals(ctx.actorId().value())) {
			throw new BusinessRuleViolation(PlatformUserErrorCode.CANNOT_SUSPEND_SELF);
		}

		userRepository.findByIdForUpdate(ctx.tenantId(), userId)
				.orElseThrow(() -> new DomainResourceNotFound(PlatformUserErrorCode.USER_NOT_FOUND));

		userRepository.softRemoveMembership(ctx.tenantId(), userId, ctx.actorId(), now);
	}

	@Override
	public void resendInvite(UUID userId) {
		authorize(SystemPermission.PLATFORM_USER_MANAGE);
		// Logic to trigger outbound invite email template
	}

	@Override
	public void resetPassword(UUID userId) {
		authorize(SystemPermission.PLATFORM_USER_MANAGE);
		// Logic to trigger admin password reset email
	}

	@Override
	public void revokeSessions(UUID userId) {
		authorize(SystemPermission.PLATFORM_SECURITY_MANAGE);
		// Logic to revoke active sessions for target user
	}

	@Override
	@Transactional(readOnly = true)
	public TenantUserStatsDto getStats() {
		AccessContext ctx = authorize(SystemPermission.PLATFORM_USER_READ);
		return userRepository.getStats(ctx.tenantId());
	}

	private AccessContext authorize(SystemPermission permission) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(permission);
		return new AccessContext(tenantId, actorId);
	}

	private record AccessContext(TenantId tenantId, ActorId actorId) {}
}
