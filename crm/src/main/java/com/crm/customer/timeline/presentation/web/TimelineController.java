package com.crm.customer.timeline.presentation.web;

import java.util.List;

import com.crm.customer.timeline.application.dto.TimelineItem;
import com.crm.customer.timeline.application.service.TimelineApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/timeline")
public class TimelineController {

	private final TimelineApplicationService timelineService;

	public TimelineController(TimelineApplicationService timelineService) {
		this.timelineService = timelineService;
	}

	@GetMapping("/{entityType}/{entityId}")
	public ResponseEntity<List<TimelineItem>> getTimeline(
			@PathVariable String entityType,
			@PathVariable String entityId) {
		List<TimelineItem> items = timelineService.getTimeline(entityType, entityId);
		return ResponseEntity.ok(items);
	}

}
