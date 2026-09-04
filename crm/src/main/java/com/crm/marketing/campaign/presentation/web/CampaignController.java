package com.crm.marketing.campaign.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.marketing.campaign.application.dto.CampaignDetails;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.usecase.CampaignFacade;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/campaigns", "/api/marketing/campaigns"})
public final class CampaignController {

	private final CampaignFacade campaigns;
	private final CampaignWebMapper mapper;

	public CampaignController(CampaignFacade campaigns, CampaignWebMapper mapper) {
		this.campaigns = campaigns;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<CampaignResponse> create(@Valid @RequestBody CreateCampaignRequest request) {
		CampaignDetails created = campaigns.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public CampaignResponse get(@PathVariable UUID id) {
		return mapper.toResponse(campaigns.get(new CampaignId(id)));
	}

	@GetMapping
	public PageResult<CampaignSummaryResponse> search(@Valid @ModelAttribute CampaignSearchRequest request) {
		return mapper.toSummaryPage(campaigns.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public CampaignResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateCampaignRequest request) {
		return mapper.toResponse(campaigns.update(mapper.toUpdateCommand(new CampaignId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		campaigns.delete(new CampaignId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/members")
	public ResponseEntity<CampaignMemberResponse> addMember(
			@PathVariable UUID id,
			@Valid @RequestBody AddCampaignMemberRequest request) {
		CampaignMemberDetails member = campaigns.addMember(mapper.toAddMemberCommand(new CampaignId(id), request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toMemberResponse(member));
	}

	@GetMapping("/{id}/members")
	public PageResult<CampaignMemberResponse> listMembers(
			@PathVariable UUID id,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return mapper.toMemberPage(campaigns.listMembers(new CampaignId(id), PageQuery.of(page, size)));
	}

	@PutMapping("/{id}/members/{memberId}")
	public CampaignMemberResponse updateMemberStatus(
			@PathVariable UUID id,
			@PathVariable UUID memberId,
			@Valid @RequestBody UpdateCampaignMemberStatusRequest request) {
		return mapper.toMemberResponse(campaigns.updateMemberStatus(
				mapper.toUpdateMemberStatusCommand(new CampaignId(id), new CampaignMemberId(memberId), request)));
	}

	@DeleteMapping("/{id}/members/{memberId}")
	public ResponseEntity<Void> removeMember(
			@PathVariable UUID id,
			@PathVariable UUID memberId) {
		campaigns.removeMember(new CampaignId(id), new CampaignMemberId(memberId));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/stats")
	public com.crm.marketing.campaign.application.dto.CampaignStatsDto getStats() {
		return campaigns.getStats();
	}

	@org.springframework.web.bind.annotation.PatchMapping("/{id}/status")
	public CampaignResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody ChangeCampaignStatusRequest request) {
		CampaignDetails updated = campaigns.updateStatus(
				new com.crm.marketing.campaign.application.command.ChangeCampaignStatusCommand(
						new CampaignId(id),
						request.status()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/{id}/members/bulk")
	public ResponseEntity<java.util.Map<String, Object>> bulkAddMembers(
			@PathVariable UUID id,
			@Valid @RequestBody BulkAddCampaignMembersRequest request) {
		var entries = request.members().stream()
				.map(m -> new com.crm.marketing.campaign.application.command.BulkAddCampaignMembersCommand.MemberEntry(
						m.leadId(),
						m.contactId(),
						m.memberStatus()
				)).toList();
		int addedCount = campaigns.bulkAddMembers(
				new com.crm.marketing.campaign.application.command.BulkAddCampaignMembersCommand(
						new CampaignId(id),
						entries
				));
		return ResponseEntity.ok(java.util.Map.of("addedCount", addedCount));
	}

	@PostMapping("/bulk/status")
	public ResponseEntity<java.util.Map<String, Object>> bulkChangeStatus(
			@Valid @RequestBody BulkChangeCampaignStatusRequest request) {
		int updatedCount = campaigns.bulkChangeStatus(
				new com.crm.marketing.campaign.application.command.BulkChangeCampaignStatusCommand(
						request.campaignIds(),
						request.status()
				));
		return ResponseEntity.ok(java.util.Map.of("updatedCount", updatedCount));
	}

}
