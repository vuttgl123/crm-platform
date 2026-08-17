package com.crm.customer.lead.application.dto;

import java.util.List;

public record LeadScoringResult(
		String leadId,
		int score,
		String grade,
		List<String> scoringFactors,
		String recommendedAction
) {
}
