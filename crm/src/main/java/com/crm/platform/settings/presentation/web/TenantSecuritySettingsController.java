package com.crm.platform.settings.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.platform.settings.application.dto.ActiveSessionDto;
import com.crm.platform.settings.application.dto.IpWhitelistRuleDto;
import com.crm.platform.settings.application.dto.PasswordPolicyDto;
import com.crm.platform.settings.application.dto.SecuritySettingsDto;
import com.crm.platform.settings.application.usecase.TenantSettingsFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/settings/security")
public final class TenantSecuritySettingsController {

	private final TenantSettingsFacade facade;
	private final TenantSettingsWebMapper mapper;

	public TenantSecuritySettingsController(TenantSettingsFacade facade, TenantSettingsWebMapper mapper) {
		this.facade = facade;
		this.mapper = mapper;
	}

	@GetMapping
	public ResponseEntity<SecuritySettingsDto> getSecurity() {
		return ResponseEntity.ok(facade.getSecuritySettings());
	}

	@PutMapping
	public ResponseEntity<SecuritySettingsDto> updateSecurity(
			@Valid @RequestBody UpdateSecurityRequest request) {
		return ResponseEntity.ok(facade.updateSecuritySettings(mapper.toCommand(request)));
	}

	@GetMapping("/ip-whitelist")
	public ResponseEntity<List<IpWhitelistRuleDto>> listIpWhitelist() {
		return ResponseEntity.ok(facade.listIpWhitelistRules());
	}

	@PostMapping("/ip-whitelist")
	public ResponseEntity<IpWhitelistRuleDto> addIpWhitelist(
			@Valid @RequestBody AddIpWhitelistRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(facade.addIpWhitelistRule(mapper.toCommand(request)));
	}

	@DeleteMapping("/ip-whitelist/{ruleId}")
	public ResponseEntity<Void> deleteIpWhitelist(@PathVariable UUID ruleId) {
		facade.deleteIpWhitelistRule(ruleId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/active-sessions")
	public ResponseEntity<List<ActiveSessionDto>> listActiveSessions() {
		return ResponseEntity.ok(facade.listActiveSessions());
	}

	@PostMapping("/sessions/revoke-all")
	public ResponseEntity<Void> revokeAllSessions() {
		facade.revokeAllSessions();
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/sessions/{sessionId}/revoke")
	public ResponseEntity<Void> revokeSession(@PathVariable UUID sessionId) {
		facade.revokeSession(sessionId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/password-policy")
	public ResponseEntity<PasswordPolicyDto> getPasswordPolicy() {
		return ResponseEntity.ok(facade.getPasswordPolicy());
	}

	@PutMapping("/password-policy")
	public ResponseEntity<PasswordPolicyDto> updatePasswordPolicy(
			@Valid @RequestBody UpdatePasswordPolicyRequest request) {
		return ResponseEntity.ok(facade.updatePasswordPolicy(mapper.toCommand(request)));
	}
}
