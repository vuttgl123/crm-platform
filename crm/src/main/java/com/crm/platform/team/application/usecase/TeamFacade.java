package com.crm.platform.team.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.platform.team.application.command.AddTeamMemberCommand;
import com.crm.platform.team.application.command.CreateTeamCommand;
import com.crm.platform.team.application.command.UpdateTeamCommand;
import com.crm.platform.team.application.dto.TeamDetails;
import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.domain.TeamId;

public interface TeamFacade {

	TeamDetails create(CreateTeamCommand command);

	TeamDetails get(TeamId id);

	List<TeamSummary> list();

	TeamDetails update(UpdateTeamCommand command);

	void delete(TeamId id, long version);

	TeamMemberDetails addMember(AddTeamMemberCommand command);

	void removeMember(TeamId teamId, UUID userId);

	TeamMemberDetails setPrimaryMember(TeamId teamId, UUID userId);

}
