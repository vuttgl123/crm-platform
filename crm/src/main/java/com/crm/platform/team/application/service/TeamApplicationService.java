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

	@Override
	@Transactional(readOnly = true)
	public com.crm.platform.team.application.dto.TeamStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_READ,
				SystemPermission.PLATFORM_USER_READ,
				SystemPermission.PLATFORM_ROLE_READ
		);
		return teamRepository.getStats(tenantId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<com.crm.platform.team.application.dto.TeamTreeNodeDto> getHierarchy() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_READ,
				SystemPermission.PLATFORM_USER_READ,
				SystemPermission.PLATFORM_ROLE_READ
		);

		List<TeamSummary> all = teamRepository.findAll(tenantId);
		java.util.Map<UUID, List<TeamSummary>> childrenMap = new java.util.HashMap<>();
		List<TeamSummary> roots = new java.util.ArrayList<>();

		for (TeamSummary t : all) {
			if (t.parentTeamId() == null) {
				roots.add(t);
			} else {
				childrenMap.computeIfAbsent(t.parentTeamId(), k -> new java.util.ArrayList<>()).add(t);
			}
		}

		// Also if any team has a parentId that does not exist in the list, treat as root
		java.util.Set<UUID> allIds = all.stream().map(TeamSummary::id).collect(java.util.stream.Collectors.toSet());
		for (TeamSummary t : all) {
			if (t.parentTeamId() != null && !allIds.contains(t.parentTeamId()) && !roots.contains(t)) {
				roots.add(t);
			}
		}

		return roots.stream()
				.map(root -> buildTreeNode(root, childrenMap))
				.toList();
	}

	private com.crm.platform.team.application.dto.TeamTreeNodeDto buildTreeNode(
			TeamSummary node,
			java.util.Map<UUID, List<TeamSummary>> childrenMap) {
		List<TeamSummary> childSummaries = childrenMap.getOrDefault(node.id(), List.of());
		List<com.crm.platform.team.application.dto.TeamTreeNodeDto> children = childSummaries.stream()
				.map(c -> buildTreeNode(c, childrenMap))
				.toList();

		return new com.crm.platform.team.application.dto.TeamTreeNodeDto(
				node.id(),
				node.name(),
				node.description(),
				node.parentTeamId(),
				node.managerUserId(),
				null,
				node.status(),
				node.activeMembersCount(),
				children
		);
	}

	@Override
	@Transactional
	public TeamDetails transferManager(TeamId teamId, UUID newManagerUserId) {
		Objects.requireNonNull(teamId, "teamId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		teamRepository.findById(tenantId, teamId)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		teamRepository.updateManager(tenantId, teamId, newManagerUserId, timeProvider.now());
		return get(teamId);
	}

	@Override
	@Transactional
	public void changeStatus(TeamId teamId, String status) {
		Objects.requireNonNull(teamId, "teamId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requireAny(
				SystemPermission.PLATFORM_TEAM_MANAGE,
				SystemPermission.PLATFORM_USER_MANAGE,
				SystemPermission.PLATFORM_ROLE_MANAGE
		);

		teamRepository.findById(tenantId, teamId)
				.orElseThrow(() -> new DomainResourceNotFound(TeamErrorCode.TEAM_NOT_FOUND.code()));

		teamRepository.updateStatus(tenantId, teamId, status, timeProvider.now());
	}

	@Override
	@Transactional
	public void batchUpdateMembers(com.crm.platform.team.application.command.BatchTeamMembersCommand command) {
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

		Instant now = timeProvider.now();

		if (command.removeMemberUserIds() != null) {
			for (UUID removeId : command.removeMemberUserIds()) {
				teamRepository.removeMember(tenantId, command.teamId(), removeId);
			}
		}

		if (command.addMemberUserIds() != null) {
			String role = command.defaultMemberRole() != null ? command.defaultMemberRole() : "MEMBER";
			for (UUID addId : command.addMemberUserIds()) {
				if (teamRepository.findMember(tenantId, command.teamId(), addId).isEmpty()) {
					TeamMember member = TeamMember.create(
							tenantId,
							command.teamId(),
							addId,
							role,
							false,
							actorId,
							now
					);
					teamRepository.insertMember(member);
				}
			}
		}
	}

}
