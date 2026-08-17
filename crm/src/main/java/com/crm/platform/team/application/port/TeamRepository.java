package com.crm.platform.team.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.team.application.dto.TeamDetails;
import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamId;
import com.crm.platform.team.domain.TeamMember;
import com.crm.sharedkernel.domain.TenantId;

public interface TeamRepository {

	Optional<Team> findById(TenantId tenantId, TeamId id);

	Optional<Team> findByName(TenantId tenantId, String name);

	boolean existsByName(TenantId tenantId, String name);

	List<TeamSummary> findAll(TenantId tenantId);

	void insert(Team team);

	void update(Team team);

	void insertMember(TeamMember member);

	void updateMember(TeamMember member);

	void removeMember(TenantId tenantId, TeamId teamId, UUID userId);

	void clearPrimaryForUser(TenantId tenantId, UUID userId);

	Optional<TeamMember> findMember(TenantId tenantId, TeamId teamId, UUID userId);

	List<TeamMemberDetails> findMembersByTeam(TenantId tenantId, TeamId teamId);

}
