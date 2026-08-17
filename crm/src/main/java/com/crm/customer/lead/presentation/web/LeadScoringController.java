package com.crm.customer.lead.presentation.web;

import java.util.UUID;

import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.dto.LeadScoringResult;
import com.crm.customer.lead.application.service.LeadScoringService;
import com.crm.customer.lead.domain.LeadId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leads")
public class LeadScoringController {

	private final LeadScoringService scoringService;

	public LeadScoringController(LeadScoringService scoringService) {
		this.scoringService = scoringService;
	}

	@PostMapping("/{id}/calculate-score")
	public ResponseEntity<LeadScoringResult> calculateScore(@PathVariable UUID id) {
		LeadScoringResult result = scoringService.calculateScore(new LeadId(id));
		return ResponseEntity.ok(result);
	}

	@PostMapping("/{id}/auto-assign")
	public ResponseEntity<LeadDetails> autoAssign(@PathVariable UUID id) {
		LeadDetails result = scoringService.autoAssign(new LeadId(id));
		return ResponseEntity.ok(result);
	}

}
