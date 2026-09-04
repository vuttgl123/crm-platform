package com.crm.customer.activity.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.activity.application.command.DeleteActivityCommand;
import com.crm.customer.activity.application.dto.ActivityDetails;
import com.crm.customer.activity.application.usecase.ActivityFacade;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
public final class ActivityController {

	private final ActivityFacade activities;
	private final ActivityWebMapper mapper;

	public ActivityController(ActivityFacade activities, ActivityWebMapper mapper) {
		this.activities = activities;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ActivityResponse> create(
			@Valid @RequestBody CreateActivityRequest request) {
		ActivityDetails created = activities.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public ActivityResponse get(@PathVariable UUID id) {
		return mapper.toResponse(activities.get(new ActivityId(id)));
	}

	@GetMapping
	public PageResult<ActivitySummaryResponse> search(
			@Valid @ModelAttribute ActivitySearchRequest request) {
		return mapper.toSummaryPage(
				activities.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public ActivityResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateActivityRequest request) {
		return mapper.toResponse(activities.update(
				mapper.toUpdateCommand(new ActivityId(id), request)));
	}

	@PostMapping("/{id}/complete")
	public ActivityResponse complete(@PathVariable UUID id,
			@Valid @RequestBody(required = false) CompleteActivityRequest request,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		String outcomeCode = request == null ? null : request.outcomeCode();
		return mapper.toResponse(activities.complete(
				mapper.toCompleteCommand(new ActivityId(id), outcomeCode, IfMatchVersion.parse(ifMatch))));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		activities.delete(new DeleteActivityCommand(
				new ActivityId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/stats")
	public com.crm.customer.activity.application.dto.ActivityStatsDto getStats() {
		return activities.getStats();
	}

	@PostMapping("/{id}/reschedule")
	public ActivityResponse reschedule(
			@PathVariable UUID id,
			@Valid @RequestBody RescheduleActivityRequest request) {
		ActivityDetails updated = activities.reschedule(
				new com.crm.customer.activity.application.command.RescheduleActivityCommand(
						new ActivityId(id),
						request.startsAt(),
						request.dueAt(),
						request.version()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/{id}/cancel")
	public ActivityResponse cancel(
			@PathVariable UUID id,
			@Valid @RequestBody CancelActivityRequest request) {
		ActivityDetails updated = activities.cancel(
				new com.crm.customer.activity.application.command.CancelActivityCommand(
						new ActivityId(id),
						request.cancelReason(),
						request.version()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/bulk/complete")
	public ResponseEntity<java.util.Map<String, Object>> bulkComplete(
			@Valid @RequestBody BulkCompleteActivitiesRequest request) {
		int completedCount = activities.bulkComplete(
				new com.crm.customer.activity.application.command.BulkCompleteActivitiesCommand(
						request.activityIds(),
						request.outcomeCode()
				));
		return ResponseEntity.ok(java.util.Map.of("completedCount", completedCount));
	}

}
