package com.crm.platform.settings.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.platform.settings.application.dto.AlertRulesDto;
import com.crm.platform.settings.application.dto.AutomationSettingsDto;
import com.crm.platform.settings.application.dto.LeadRoutingRuleDto;
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
@RequestMapping("/api/platform/settings/automation")
public final class TenantAutomationSettingsController {

	private final TenantSettingsFacade facade;
	private final TenantSettingsWebMapper mapper;

	public TenantAutomationSettingsController(TenantSettingsFacade facade, TenantSettingsWebMapper mapper) {
		this.facade = facade;
		this.mapper = mapper;
	}

	@GetMapping("/lead-routing")
	public ResponseEntity<AutomationSettingsDto> getLeadRouting() {
		return ResponseEntity.ok(facade.getAutomationSettings());
	}

	@PutMapping("/lead-routing")
	public ResponseEntity<AutomationSettingsDto> updateLeadRouting(
			@Valid @RequestBody UpdateAutomationRequest request) {
		return ResponseEntity.ok(facade.updateAutomationSettings(mapper.toCommand(request)));
	}

	@GetMapping("/lead-routing/rules")
	public ResponseEntity<List<LeadRoutingRuleDto>> listLeadRoutingRules() {
		return ResponseEntity.ok(facade.listLeadRoutingRules());
	}

	@PostMapping("/lead-routing/rules")
	public ResponseEntity<LeadRoutingRuleDto> addLeadRoutingRule(
			@Valid @RequestBody AddLeadRoutingRuleRequest request) {
		LeadRoutingRuleDto dto = new LeadRoutingRuleDto(
				null,
				request.ruleName(),
				request.priority(),
				request.conditionField(),
				request.conditionOperator(),
				request.conditionValue(),
				request.assignToUserId(),
				request.assignToTeamId(),
				request.active()
		);
		return ResponseEntity.status(HttpStatus.CREATED).body(facade.addLeadRoutingRule(dto));
	}

	@PutMapping("/lead-routing/rules/{ruleId}")
	public ResponseEntity<LeadRoutingRuleDto> updateLeadRoutingRule(
			@PathVariable UUID ruleId,
			@Valid @RequestBody AddLeadRoutingRuleRequest request) {
		LeadRoutingRuleDto dto = new LeadRoutingRuleDto(
				ruleId,
				request.ruleName(),
				request.priority(),
				request.conditionField(),
				request.conditionOperator(),
				request.conditionValue(),
				request.assignToUserId(),
				request.assignToTeamId(),
				request.active()
		);
		return ResponseEntity.ok(facade.updateLeadRoutingRule(ruleId, dto));
	}

	@DeleteMapping("/lead-routing/rules/{ruleId}")
	public ResponseEntity<Void> deleteLeadRoutingRule(@PathVariable UUID ruleId) {
		facade.deleteLeadRoutingRule(ruleId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/alert-rules")
	public ResponseEntity<AlertRulesDto> getAlertRules() {
		return ResponseEntity.ok(facade.getAlertRules());
	}

	@PutMapping("/alert-rules")
	public ResponseEntity<AlertRulesDto> updateAlertRules(
			@Valid @RequestBody UpdateAlertRulesRequest request) {
		return ResponseEntity.ok(facade.updateAlertRules(mapper.toCommand(request)));
	}
}
