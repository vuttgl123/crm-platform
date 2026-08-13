package com.crm.platform.access.application.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.stream.Collectors;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.access.application.command.CreateRoleCommand;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.command.RoleScopeInput;
import com.crm.platform.access.application.command.UpdateRoleCommand;
import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.application.port.RoleManagementRepository;
import com.crm.platform.access.application.usecase.RoleManagementFacade;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleDataScope;
import com.crm.platform.access.domain.RoleErrorCode;
import com.crm.platform.access.domain.RoleId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleManagementApplicationService
		implements RoleManagementFacade {

	private final RoleManagementRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final PermissionChecker permissionChecker;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public RoleManagementApplicationService(
			RoleManagementRepository repository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			PermissionChecker permissionChecker,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.permissionChecker = permissionChecker;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional(readOnly = true)
	public List<PermissionCatalogueItem> permissions() {
		authorize(SystemPermission.PLATFORM_ROLE_READ);
		return repository.findPermissions();
	}

	@Override
	@Transactional(readOnly = true)
	public List<RoleSummary> roles() {
		AccessContext context = authorize(
				SystemPermission.PLATFORM_ROLE_READ);
		return repository.findRoleSummaries(context.tenantId());
	}

	@Override
	@Transactional(readOnly = true)
	public RoleDetails get(RoleId roleId) {
		Objects.requireNonNull(roleId, "roleId must not be null");
		AccessContext context = authorize(
				SystemPermission.PLATFORM_ROLE_READ);
		return repository.findById(context.tenantId(), roleId)
				.map(RoleDetails::from)
				.orElseThrow(RoleManagementApplicationService::roleNotFound);
	}

	@Override
	@Transactional
	public RoleDetails create(CreateRoleCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(
				SystemPermission.PLATFORM_ROLE_MANAGE);
		String roleCode = Role.normalizeRoleCode(command.roleCode());
		if (repository.existsNonDeletedRoleCode(
				context.tenantId(), roleCode)) {
			throw roleCodeConflict();
		}

		List<RoleDataScope> scopes = validatedScopes(
				context.tenantId(), command.dataScopes());
		validatePermissions(command.permissionCodes());
		Role role = Role.create(
				context.tenantId(),
				new RoleId(identifierGenerator.nextId()),
				roleCode,
				command.name(),
				command.description(),
				command.permissionCodes(),
				scopes,
				context.actorId(),
				timeProvider.now());
		try {
			repository.insert(role);
		}
		catch (DuplicateKeyException exception) {
			throw roleCodeConflict();
		}
		repository.replacePermissionGrants(role);
		repository.replaceDataScopeGrants(role);
		return reload(context.tenantId(), role.id());
	}

	@Override
	@Transactional
	public RoleDetails update(UpdateRoleCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(
				SystemPermission.PLATFORM_ROLE_MANAGE);
		Role role = findForUpdate(context.tenantId(), command.roleId());
		requireMutable(role);
		requireVersion(role, command.version());

		List<RoleDataScope> scopes = validatedScopes(
				context.tenantId(), command.dataScopes());
		validatePermissions(command.permissionCodes());
		long expectedVersion = role.version();
		role.replace(
				command.name(), command.description(), command.status(),
				command.permissionCodes(), scopes,
				context.actorId(), timeProvider.now());
		if (repository.update(role, expectedVersion) != 1) {
			throw versionConflict();
		}
		repository.replacePermissionGrants(role);
		repository.replaceDataScopeGrants(role);
		return reload(context.tenantId(), role.id());
	}

	@Override
	@Transactional
	public void delete(DeleteRoleCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(
				SystemPermission.PLATFORM_ROLE_MANAGE);
		Role role = findForUpdate(context.tenantId(), command.roleId());
		requireMutable(role);
		requireVersion(role, command.version());
		long expectedVersion = role.version();
		role.softDelete(context.actorId(), timeProvider.now());
		if (repository.softDelete(role, expectedVersion) != 1) {
			throw versionConflict();
		}
	}

	private AccessContext authorize(SystemPermission permission) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(permission);
		return new AccessContext(tenantId, actorId);
	}

	private void validatePermissions(List<String> permissionCodes) {
		Set<String> requested = permissionCodes.stream()
				.map(String::trim)
				.collect(Collectors.toCollection(TreeSet::new));
		if (!repository.findKnownPermissionCodes(requested).equals(requested)) {
			throw new BusinessRuleViolation(
					RoleErrorCode.ROLE_PERMISSION_UNKNOWN);
		}
	}

	private List<RoleDataScope> validatedScopes(
			TenantId tenantId, List<RoleScopeInput> inputs) {
		List<RoleDataScope> scopes;
		try {
			scopes = inputs.stream()
					.map(input -> new RoleDataScope(
							input.entityType(), input.type(), input.teamId()))
					.sorted()
					.toList();
		}
		catch (IllegalArgumentException exception) {
			throw new BusinessRuleViolation(
					RoleErrorCode.ROLE_DATA_SCOPE_INVALID);
		}
		Set<UUID> teamIds = scopes.stream()
				.map(RoleDataScope::teamId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());
		if (!repository.allTeamsAreActive(tenantId, teamIds)) {
			throw new BusinessRuleViolation(
					RoleErrorCode.ROLE_DATA_SCOPE_INVALID);
		}
		return scopes;
	}

	private Role findForUpdate(TenantId tenantId, RoleId roleId) {
		return repository.findByIdForUpdate(tenantId, roleId)
				.orElseThrow(RoleManagementApplicationService::roleNotFound);
	}

	private RoleDetails reload(TenantId tenantId, RoleId roleId) {
		return repository.findById(tenantId, roleId)
				.map(RoleDetails::from)
				.orElseThrow(() -> new IllegalStateException(
						"Persisted Role must remain readable"));
	}

	private static void requireMutable(Role role) {
		if (role.system()) {
			throw new ResourceConflict(
					RoleErrorCode.SYSTEM_ROLE_IMMUTABLE);
		}
	}

	private static void requireVersion(Role role, long version) {
		if (role.version() != version) {
			throw versionConflict();
		}
	}

	private static DomainResourceNotFound roleNotFound() {
		return new DomainResourceNotFound(RoleErrorCode.ROLE_NOT_FOUND);
	}

	private static ResourceConflict roleCodeConflict() {
		return new ResourceConflict(
				RoleErrorCode.ROLE_CODE_ALREADY_EXISTS);
	}

	private static ResourceConflict versionConflict() {
		return new ResourceConflict(RoleErrorCode.ROLE_VERSION_CONFLICT);
	}

	private record AccessContext(TenantId tenantId, ActorId actorId) {
	}

}
