package com.crm.platform.team.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.team.application.command.CreateRoleDataScopeCommand;
import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.application.port.RoleDataScopeRepository;
import com.crm.platform.team.application.port.TeamRepository;
import com.crm.platform.team.application.usecase.RoleDataScopeFacade;
import com.crm.platform.team.domain.DataScopeType;
import com.crm.platform.team.domain.RoleDataScope;
import com.crm.platform.team.domain.RoleDataScopeId;
import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleDataScopeApplicationService implements RoleDataScopeFacade {

	private final RoleDataScopeRepository scopeRepository;
	private final TeamRepository teamRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public RoleDataScopeApplicationService(
			RoleDataScopeRepository scopeRepository,
			TeamRepository teamRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.scopeRepository = scopeRepository;
		this.teamRepository = teamRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public RoleDataScopeDetails create(CreateRoleDataScopeCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PLATFORM_ROLE_MANAGE);

		String teamName = null;
		if (command.scopeType() == DataScopeType.TEAM || command.scopeType() == DataScopeType.TEAM_TREE) {
			if (command.teamId() == null) {
				throw new ResourceConflict(TeamErrorCode.INVALID_DATA_SCOPE_CONFIGURATION.code());
			}
			Team team = teamRepository.findById(tenantId, command.teamId())
					.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));
			teamName = team.name();
		}
		else if (command.teamId() != null) {
			throw new ResourceConflict(TeamErrorCode.INVALID_DATA_SCOPE_CONFIGURATION.code());
		}

		Instant now = timeProvider.now();
		RoleDataScopeId id = new RoleDataScopeId(identifierGenerator.nextId());

		RoleDataScope scope = RoleDataScope.create(
				tenantId,
				id,
				command.roleId(),
				command.entityType(),
				command.scopeType(),
				command.teamId(),
				actorId,
				now
		);

		scopeRepository.insert(scope);
		return RoleDataScopeDetails.from(scope, teamName);
	}

	@Override
	@Transactional(readOnly = true)
	public List<RoleDataScopeDetails> listByRole(UUID roleId) {
		Objects.requireNonNull(roleId, "roleId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PLATFORM_ROLE_READ);
		return scopeRepository.findByRoleId(tenantId, roleId);
	}

	@Override
	@Transactional
	public void delete(RoleDataScopeId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PLATFORM_ROLE_MANAGE);

		scopeRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.DATA_SCOPE_NOT_FOUND.code()));

		scopeRepository.delete(tenantId, id);
	}

}
