package com.crm.marketing.drip.application.dto;

import java.util.List;
import java.util.UUID;

public record DripCampaignSummary(
		UUID id,
		String name,
		String description,
		String triggerEvent,
		String targetAudience,
		String status,
		int totalEnrolled,
		int activeSubscribers,
		int completedSubscribers,
		int stepCount,
		List<DripStepDto> steps,
		String createdAt
) {
	public DripCampaignSummary(
			UUID id,
			String name,
			String description,
			String triggerEvent,
			String targetAudience,
			String status,
			int totalEnrolled,
			int activeSubscribers,
			int completedSubscribers,
			int stepCount,
			String createdAt
	) {
		this(id, name, description, triggerEvent, targetAudience, status, totalEnrolled, activeSubscribers, completedSubscribers, stepCount, List.of(), createdAt);
	}
}
