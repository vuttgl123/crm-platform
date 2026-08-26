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
import com.crm.platform.team.application.command.AddTeamMemberCommand;
import com.crm.platform.team.application.command.CreateTeamCommand;
import com.crm.platform.team.application.command.UpdateTeamCommand;
import com.crm.platform.team.application.dto.TeamDetails;
import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.application.port.TeamRepository;
import com.crm.platform.team.application.usecase.TeamFacade;
import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamErrorCode;
import com.crm.platform.team.domain.TeamId;
import com.crm.platform.team.domain.TeamMember;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamApplicationService implements TeamFacade {

	private final TeamRepository teamRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TeamApplicationService(
			TeamRepository teamRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.teamRepository = teamRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public TeamDetails create(CreateTeamCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		if (teamRepository.existsByName(tenantId, command.name())) {
			throw new ResourceConflict(TeamErrorCode.TEAM_NAME_ALREADY_EXISTS.code());
		}

		if (command.parentTeamId() != null) {
			teamRepository.findById(tenantId, command.parentTeamId())
					.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));
		}

		Instant now = timeProvider.now();
		TeamId id = new TeamId(identifierGenerator.nextId());

		Team team = Team.create(
				tenantId,
				id,
				command.name(),
				command.description(),
				command.parentTeamId(),
				command.managerUserId(),
				actorId,
				now
		);

		try {
			teamRepository.insert(team);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(TeamErrorCode.TEAM_NAME_ALREADY_EXISTS.code());
		}

		return TeamDetails.from(team, List.of());
	}

	@Override
	@Transactional(readOnly = true)
	public TeamDetails get(TeamId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_READ,
				SystemPermission.PLATFORM_ROLE_READ,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.CRM_ACCOUNT_READ
		);

		Team team = teamRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		List<TeamMemberDetails> members = teamRepository.findMembersByTeam(tenantId, id);
		return TeamDetails.from(team, members);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TeamSummary> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_READ,
				SystemPermission.PLATFORM_ROLE_READ,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.CRM_ACCOUNT_READ
		);
		return teamRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public TeamDetails update(UpdateTeamCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		Team team = teamRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		if (team.version() != command.version()) {
			throw new ResourceConflict(TeamErrorCode.TEAM_VERSION_CONFLICT.code());
		}

		if (command.parentTeamId() != null) {
			if (command.parentTeamId().equals(command.id())) {
				throw new ResourceConflict(TeamErrorCode.TEAM_CIRCULAR_PARENT_REFERENCE.code());
			}
			teamRepository.findById(tenantId, command.parentTeamId())
					.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));
		}

		team.update(
				command.name(),
				command.description(),
				command.parentTeamId(),
				command.managerUserId(),
				command.status(),
				actorId,
				timeProvider.now()
		);

		try {
			teamRepository.update(team);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(TeamErrorCode.TEAM_NAME_ALREADY_EXISTS.code());
		}

		List<TeamMemberDetails> members = teamRepository.findMembersByTeam(tenantId, command.id());
		return TeamDetails.from(team, members);
	}

	@Override
	@Transactional
	public void delete(TeamId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		Team team = teamRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		if (team.version() != version) {
			throw new ResourceConflict(TeamErrorCode.TEAM_VERSION_CONFLICT.code());
		}

		team.delete(actorId, timeProvider.now());
		teamRepository.update(team);
	}

	@Override
	@Transactional
	public TeamMemberDetails addMember(AddTeamMemberCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		Team team = teamRepository.findById(tenantId, command.teamId())
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		if (command.primary()) {
			teamRepository.clearPrimaryForUser(tenantId, command.userId());
		}

		Instant now = timeProvider.now();
		TeamMember member = TeamMember.create(
				tenantId,
				command.teamId(),
				command.userId(),
				command.memberRole(),
				command.primary(),
				actorId,
				now
		);

		try {
			teamRepository.insertMember(member);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(TeamErrorCode.TEAM_MEMBER_ALREADY_EXISTS.code());
		}

		return new TeamMemberDetails(command.teamId().value(), command.userId(), null, null, command.memberRole(), command.primary(), now, null);
	}

	@Override
	@Transactional
	public void removeMember(TeamId teamId, UUID userId) {
		Objects.requireNonNull(teamId, "teamId must not be null");
		Objects.requireNonNull(userId, "userId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		teamRepository.findMember(tenantId, teamId, userId)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_MEMBER_NOT_FOUND.code()));

		teamRepository.removeMember(tenantId, teamId, userId);
	}

	@Override
	@Transactional
	public TeamMemberDetails setPrimaryMember(TeamId teamId, UUID userId) {
		Objects.requireNonNull(teamId, "teamId must not be null");
		Objects.requireNonNull(userId, "userId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		TeamMember member = teamRepository.findMember(tenantId, teamId, userId)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_MEMBER_NOT_FOUND.code()));

		teamRepository.clearPrimaryForUser(tenantId, userId);
		member.setPrimary(true);
		teamRepository.updateMember(member);

		return new TeamMemberDetails(teamId.value(), userId, null, null, member.memberRole(), true, member.joinedAt(), member.leftAt());
	}

}
