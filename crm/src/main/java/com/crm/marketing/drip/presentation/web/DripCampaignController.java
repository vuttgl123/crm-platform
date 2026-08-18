package com.crm.marketing.drip.presentation.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.crm.marketing.drip.application.dto.CreateDripCampaignRequest;
import com.crm.marketing.drip.application.dto.DripCampaignAnalyticsResponse;
import com.crm.marketing.drip.application.dto.DripCampaignSummary;
import com.crm.marketing.drip.application.dto.EnrollSubscriberRequest;
import com.crm.marketing.drip.application.service.DripCampaignService;
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
@RequestMapping("/api/marketing/drip-campaigns")
public class DripCampaignController {

	private final DripCampaignService dripCampaignService;

	public DripCampaignController(DripCampaignService dripCampaignService) {
		this.dripCampaignService = dripCampaignService;
	}

	@PostMapping
	public ResponseEntity<DripCampaignSummary> createCampaign(@RequestBody CreateDripCampaignRequest request) {
		DripCampaignSummary summary = dripCampaignService.createCampaign(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(summary);
	}

	@GetMapping
	public ResponseEntity<List<DripCampaignSummary>> listCampaigns() {
		List<DripCampaignSummary> list = dripCampaignService.listCampaigns();
		return ResponseEntity.ok(list);
	}

	@GetMapping("/{id}")
	public ResponseEntity<DripCampaignSummary> getCampaign(@PathVariable UUID id) {
		DripCampaignSummary campaign = dripCampaignService.getCampaign(id);
		return ResponseEntity.ok(campaign);
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<DripCampaignSummary> updateCampaignStatus(
			@PathVariable UUID id,
			@RequestBody Map<String, String> payload
	) {
		String status = payload.getOrDefault("status", "ACTIVE");
		DripCampaignSummary updated = dripCampaignService.updateStatus(id, status);
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
		dripCampaignService.deleteCampaign(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/enroll")
	public ResponseEntity<Boolean> enrollSubscriber(
			@PathVariable UUID id,
			@RequestBody EnrollSubscriberRequest request
	) {
		boolean success = dripCampaignService.enrollSubscriber(id, request);
		return ResponseEntity.ok(success);
	}

	@GetMapping("/{id}/analytics")
	public ResponseEntity<DripCampaignAnalyticsResponse> getCampaignAnalytics(@PathVariable UUID id) {
		DripCampaignAnalyticsResponse analytics = dripCampaignService.getCampaignAnalytics(id);
		return ResponseEntity.ok(analytics);
	}
}
