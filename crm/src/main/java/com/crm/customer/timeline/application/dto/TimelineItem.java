package com.crm.customer.timeline.application.dto;

import java.time.Instant;
import java.util.Map;

import com.crm.customer.timeline.domain.TimelineCategory;

public record TimelineItem(
		String id,
		String eventType,
		String title,
		String description,
		String actorName,
		Instant occurredAt,
		TimelineCategory category,
		Map<String, Object> metadata,
		boolean pinned
) {
}
