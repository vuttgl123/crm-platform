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

	@Override
	@Transactional(readOnly = true)
	public com.crm.platform.access.application.dto.RoleStatsDto getStats() {
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_READ);
		return repository.getStats(context.tenantId());
	}

	@Override
	@Transactional
	public RoleDetails clone(com.crm.platform.access.application.command.CloneRoleCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_MANAGE);

		Role sourceRole = repository.findById(context.tenantId(), new RoleId(command.sourceRoleId()))
				.orElseThrow(RoleManagementApplicationService::roleNotFound);

		if (repository.existsNonDeletedRoleCode(context.tenantId(), command.newRoleCode())) {
			throw roleCodeConflict();
		}

		RoleId newRoleId = new RoleId(identifierGenerator.generateId());
		Instant now = timeProvider.now();

		Role clonedRole = new Role(
				context.tenantId(),
				newRoleId,
				command.newRoleCode(),
				command.newName(),
				command.description() != null ? command.description() : sourceRole.description(),
				false,
				sourceRole.status(),
				now,
				context.actorId(),
				now,
				context.actorId(),
				null,
				null,
				1L,
				sourceRole.grantedPermissionCodes(),
				sourceRole.grantedDataScopes()
		);

		try {
			repository.insert(clonedRole);
		} catch (DuplicateKeyException e) {
			throw roleCodeConflict();
		}
		repository.replacePermissionGrants(clonedRole);
		repository.replaceDataScopeGrants(clonedRole);

		return reload(context.tenantId(), newRoleId);
	}

	@Override
	@Transactional
	public void changeStatus(com.crm.platform.access.application.command.ChangeRoleStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_MANAGE);
		RoleId roleId = new RoleId(command.roleId());

		Role role = findForUpdate(context.tenantId(), roleId);
		requireMutable(role);

		repository.updateStatus(context.tenantId(), roleId, command.status().name(), context.actorId().value(), timeProvider.now());
	}

	@Override
	@Transactional(readOnly = true)
	public List<com.crm.platform.access.application.dto.RoleMemberSummaryDto> getMembers(RoleId roleId) {
		Objects.requireNonNull(roleId, "roleId must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_READ);
		return repository.findMembersByRoleId(context.tenantId(), roleId);
	}

	@Override
	@Transactional
	public void reassignMembers(com.crm.platform.access.application.command.ReassignRoleMembersCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_ASSIGN);

		RoleId sourceId = new RoleId(command.sourceRoleId());
		RoleId targetId = new RoleId(command.targetRoleId());

		repository.findById(context.tenantId(), sourceId)
				.orElseThrow(RoleManagementApplicationService::roleNotFound);
		repository.findById(context.tenantId(), targetId)
				.orElseThrow(RoleManagementApplicationService::roleNotFound);

		repository.reassignMembers(context.tenantId(), sourceId, targetId, context.actorId().value(), timeProvider.now());
	}

	@Override
	@Transactional(readOnly = true)
	public com.crm.platform.access.application.dto.RoleComparisonResultDto compare(com.crm.platform.access.application.command.CompareRolesCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_READ);

		List<Role> loadedRoles = command.roleIds().stream()
				.map(id -> repository.findById(context.tenantId(), new RoleId(id))
						.orElseThrow(RoleManagementApplicationService::roleNotFound))
				.toList();

		List<com.crm.platform.access.application.dto.RoleComparisonResultDto.RoleHeader> headers = loadedRoles.stream()
				.map(r -> new com.crm.platform.access.application.dto.RoleComparisonResultDto.RoleHeader(
						r.id().value(), r.roleCode(), r.name(), r.system()
				)).toList();

		// Permissions catalogue
		List<PermissionCatalogueItem> catalog = repository.findPermissions();

		// Common permissions (in all roles)
		Set<String> commonPerms = new TreeSet<>(loadedRoles.get(0).grantedPermissionCodes());
		for (int i = 1; i < loadedRoles.size(); i++) {
			commonPerms.retainAll(loadedRoles.get(i).grantedPermissionCodes());
		}

		// Differences
		List<com.crm.platform.access.application.dto.RoleComparisonResultDto.PermissionDiff> diffs = new java.util.ArrayList<>();
		for (PermissionCatalogueItem item : catalog) {
			List<UUID> grantedIn = new java.util.ArrayList<>();
			for (Role r : loadedRoles) {
				if (r.grantedPermissionCodes().contains(item.permissionCode())) {
					grantedIn.add(r.id().value());
				}
			}
			// If not in all or not in none
			if (grantedIn.size() > 0 && grantedIn.size() < loadedRoles.size()) {
				diffs.add(new com.crm.platform.access.application.dto.RoleComparisonResultDto.PermissionDiff(
						item.permissionCode(),
						item.description(),
						item.moduleCode(),
						item.riskLevel(),
						grantedIn
				));
			}
		}

		// Data scope diffs
		Set<String> allEntityTypes = loadedRoles.stream()
				.flatMap(r -> r.grantedDataScopes().stream())
				.map(s -> s.entityType().name())
				.collect(Collectors.toSet());

		List<com.crm.platform.access.application.dto.RoleComparisonResultDto.DataScopeDiff> scopeDiffs = new java.util.ArrayList<>();
		for (String entityType : allEntityTypes) {
			java.util.Map<UUID, String> scopesMap = new java.util.HashMap<>();
			for (Role r : loadedRoles) {
				String scopeVal = r.grantedDataScopes().stream()
						.filter(s -> s.entityType().name().equals(entityType))
						.map(s -> s.type().name())
						.findFirst().orElse("NONE");
				scopesMap.put(r.id().value(), scopeVal);
			}
			scopeDiffs.add(new com.crm.platform.access.application.dto.RoleComparisonResultDto.DataScopeDiff(
					entityType,
					scopesMap
			));
		}

		return new com.crm.platform.access.application.dto.RoleComparisonResultDto(
				headers,
				new java.util.ArrayList<>(commonPerms),
				diffs,
				scopeDiffs
		);
	}

	@Override
	public List<com.crm.platform.access.application.dto.RoleTemplateDto> getTemplates() {
		return List.of(
				new com.crm.platform.access.application.dto.RoleTemplateDto(
						"SALES_REPRESENTATIVE",
						"Sales Representative Standard",
						"Standard frontline sales role with own account, lead & deal management",
						"Individual Contributors & SDRs",
						List.of("crm_account.read", "crm_account.write", "crm_contact.read", "crm_contact.write", "crm_lead.read", "crm_lead.write", "crm_deal.read", "crm_deal.write", "crm_activity.read", "crm_activity.write"),
						10
				),
				new com.crm.platform.access.application.dto.RoleTemplateDto(
						"SALES_TEAM_LEAD",
						"Sales Team Lead / Manager",
						"Supervisory role with team-wide lead reassignment, discount approvals & pipeline analytics",
						"Sales Managers & Regional Team Leads",
						List.of("crm_account.read", "crm_account.write", "crm_contact.read", "crm_contact.write", "crm_lead.read", "crm_lead.write", "crm_lead.delete", "crm_deal.read", "crm_deal.write", "crm_deal.delete", "crm_activity.read", "crm_activity.write", "platform_team.read"),
						13
				),
				new com.crm.platform.access.application.dto.RoleTemplateDto(
						"CUSTOMER_SUPPORT_SPECIALIST",
						"Customer Success & Support Specialist",
						"Service desk agent focused on tickets, communication history & customer contacts",
						"CS Agents & Technical Support Reps",
						List.of("crm_account.read", "crm_contact.read", "crm_contact.write", "crm_activity.read", "crm_activity.write"),
						5
				),
				new com.crm.platform.access.application.dto.RoleTemplateDto(
						"COMPLIANCE_AUDITOR_READONLY",
						"Security & Compliance Read-Only Auditor",
						"Read-only visibility across all platform audit logs, security policies & customer records",
						"Internal / External Compliance Auditors",
						List.of("audit_read", "crm_account.read", "crm_contact.read", "crm_lead.read", "crm_deal.read", "crm_activity.read", "platform_user.read", "platform_role.read", "platform_settings.read"),
						9
				)
		);
	}

	@Override
	@Transactional
	public RoleDetails instantiateTemplate(com.crm.platform.access.application.command.InstantiateRoleTemplateCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		AccessContext context = authorize(SystemPermission.PLATFORM_ROLE_MANAGE);

		var template = getTemplates().stream()
				.filter(t -> t.templateCode().equalsIgnoreCase(command.templateCode()))
				.findFirst()
				.orElseThrow(() -> new BusinessRuleViolation(RoleErrorCode.ROLE_NOT_FOUND));

		String roleCode = command.customRoleCode() != null && !command.customRoleCode().trim().isEmpty()
				? command.customRoleCode().trim().toUpperCase()
				: template.templateCode();

		String roleName = command.customName() != null && !command.customName().trim().isEmpty()
				? command.customName().trim()
				: template.name();

		if (repository.existsNonDeletedRoleCode(context.tenantId(), roleCode)) {
			throw roleCodeConflict();
		}

		RoleId newRoleId = new RoleId(identifierGenerator.generateId());
		Instant now = timeProvider.now();

		Role role = new Role(
				context.tenantId(),
				newRoleId,
				roleCode,
				roleName,
				template.description(),
				false,
				com.crm.platform.access.domain.RoleStatus.ACTIVE,
				now,
				context.actorId(),
				now,
				context.actorId(),
				null,
				null,
				1L,
				new TreeSet<>(template.defaultPermissionCodes()),
				Set.of()
		);

		try {
			repository.insert(role);
		} catch (DuplicateKeyException e) {
			throw roleCodeConflict();
		}
		repository.replacePermissionGrants(role);

		return reload(context.tenantId(), newRoleId);
	}

	@Override
	public com.crm.platform.access.application.dto.PermissionMatrixDto getPermissionMatrix() {
		List<PermissionCatalogueItem> allPermissions = repository.findPermissions();

		java.util.Map<String, List<com.crm.platform.access.application.dto.PermissionMatrixDto.PermissionItem>> grouped = new java.util.LinkedHashMap<>();
		for (PermissionCatalogueItem p : allPermissions) {
			grouped.computeIfAbsent(p.moduleCode(), k -> new java.util.ArrayList<>())
					.add(new com.crm.platform.access.application.dto.PermissionMatrixDto.PermissionItem(
							p.permissionCode(),
							p.description(),
							p.riskLevel()
					));
		}

		List<com.crm.platform.access.application.dto.PermissionMatrixDto.ModuleGroup> moduleGroups = grouped.entrySet().stream()
				.map(e -> new com.crm.platform.access.application.dto.PermissionMatrixDto.ModuleGroup(
						e.getKey(),
						e.getKey().replace('_', ' '),
						e.getValue()
				))
				.toList();

		return new com.crm.platform.access.application.dto.PermissionMatrixDto(moduleGroups, allPermissions.size());
	}

	private record AccessContext(TenantId tenantId, ActorId actorId) {
	}

}
