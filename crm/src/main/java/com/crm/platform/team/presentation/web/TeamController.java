package com.crm.platform.team.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.platform.team.application.dto.TeamDetails;
import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.usecase.TeamFacade;
import com.crm.platform.team.domain.TeamId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/teams")
public final class TeamController {

	private final TeamFacade teams;
	private final TeamWebMapper mapper;

	public TeamController(TeamFacade teams, TeamWebMapper mapper) {
		this.teams = teams;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<TeamResponse> create(@Valid @RequestBody CreateTeamRequest request) {
		TeamDetails created = teams.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public TeamResponse get(@PathVariable UUID id) {
		return mapper.toResponse(teams.get(new TeamId(id)));
	}

	@GetMapping
	public List<TeamSummaryResponse> list() {
		return mapper.toSummaryResponseList(teams.list());
	}

	@PutMapping("/{id}")
	public TeamResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateTeamRequest request) {
		return mapper.toResponse(teams.update(mapper.toUpdateCommand(new TeamId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		teams.delete(new TeamId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/members")
	public ResponseEntity<TeamMemberResponse> addMember(
			@PathVariable UUID id,
			@Valid @RequestBody AddTeamMemberRequest request) {
		TeamMemberDetails member = teams.addMember(mapper.toAddMemberCommand(new TeamId(id), request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toMemberResponse(member));
	}

	@DeleteMapping("/{id}/members/{userId}")
	public ResponseEntity<Void> removeMember(
			@PathVariable UUID id,
			@PathVariable UUID userId) {
		teams.removeMember(new TeamId(id), userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/members/{userId}/primary")
	public TeamMemberResponse setPrimaryMember(
			@PathVariable UUID id,
			@PathVariable UUID userId) {
		TeamMemberDetails member = teams.setPrimaryMember(new TeamId(id), userId);
		return mapper.toMemberResponse(member);
	}

}
