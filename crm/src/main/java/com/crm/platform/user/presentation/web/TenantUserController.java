package com.crm.platform.user.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.platform.user.application.dto.TenantUserDetailsDto;
import com.crm.platform.user.application.dto.TenantUserStatsDto;
import com.crm.platform.user.application.dto.TenantUserSummaryDto;
import com.crm.platform.user.application.usecase.TenantUserFacade;
import com.crm.platform.user.presentation.web.request.ChangeUserStatusRequest;
import com.crm.platform.user.presentation.web.request.ProvisionUserRequest;
import com.crm.platform.user.presentation.web.request.TenantUserSearchRequest;
import com.crm.platform.user.presentation.web.request.UpdateUserRequest;
import com.crm.platform.user.presentation.web.request.UpdateUserRolesRequest;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/users")
public class TenantUserController {

	private final TenantUserFacade userFacade;
	private final TenantUserWebMapper mapper;

	public TenantUserController(TenantUserFacade userFacade, TenantUserWebMapper mapper) {
		this.userFacade = userFacade;
		this.mapper = mapper;
	}

	@GetMapping
	public PageResult<TenantUserSummaryDto> search(@Valid @ModelAttribute TenantUserSearchRequest request) {
		return userFacade.search(mapper.toSearchQuery(request));
	}

	@GetMapping("/stats")
	public TenantUserStatsDto getStats() {
		return userFacade.getStats();
	}

	@PostMapping
	public ResponseEntity<TenantUserDetailsDto> provisionUser(@Valid @RequestBody ProvisionUserRequest request) {
		TenantUserDetailsDto created = userFacade.provisionUser(mapper.toProvisionCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@GetMapping("/{userId}")
	public TenantUserDetailsDto getUser(@PathVariable UUID userId) {
		return userFacade.getUser(userId);
	}

	@PutMapping("/{userId}")
	public TenantUserDetailsDto updateUser(
			@PathVariable UUID userId,
			@Valid @RequestBody UpdateUserRequest request) {
		return userFacade.updateUser(mapper.toUpdateCommand(userId, request));
	}

	@PutMapping("/{userId}/roles")
	public ResponseEntity<Void> updateUserRoles(
			@PathVariable UUID userId,
			@Valid @RequestBody UpdateUserRolesRequest request) {
		userFacade.updateUserRoles(mapper.toUpdateRolesCommand(userId, request));
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{userId}/status")
	public ResponseEntity<Void> changeUserStatus(
			@PathVariable UUID userId,
			@Valid @RequestBody ChangeUserStatusRequest request) {
		userFacade.changeUserStatus(mapper.toChangeStatusCommand(userId, request));
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{userId}")
	public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
		userFacade.deleteUser(userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{userId}/resend-invite")
	public ResponseEntity<Void> resendInvite(@PathVariable UUID userId) {
		userFacade.resendInvite(userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{userId}/reset-password")
	public ResponseEntity<Void> resetPassword(@PathVariable UUID userId) {
		userFacade.resetPassword(userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{userId}/revoke-sessions")
	public ResponseEntity<Void> revokeSessions(@PathVariable UUID userId) {
		userFacade.revokeSessions(userId);
		return ResponseEntity.noContent().build();
	}
}
