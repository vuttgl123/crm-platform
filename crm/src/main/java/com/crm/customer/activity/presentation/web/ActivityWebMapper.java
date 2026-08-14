package com.crm.customer.activity.presentation.web;

import java.util.UUID;

import com.crm.customer.activity.application.command.CompleteActivityCommand;
import com.crm.customer.activity.application.command.CreateActivityCommand;
import com.crm.customer.activity.application.command.UpdateActivityCommand;
import com.crm.customer.activity.application.dto.ActivityDetails;
import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.application.query.ActivitySearchQuery;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface ActivityWebMapper {

	CreateActivityCommand toCreateCommand(CreateActivityRequest request);

	@Mapping(target = "activityId", source = "activityId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateActivityCommand toUpdateCommand(
			ActivityId activityId, UpdateActivityRequest request);

	default CompleteActivityCommand toCompleteCommand(
			ActivityId activityId, String outcomeCode, long version) {
		return new CompleteActivityCommand(activityId, outcomeCode, version);
	}

	ActivityResponse toResponse(ActivityDetails details);

	ActivitySummaryResponse toSummaryResponse(ActivitySummary summary);

	default ActivityId toActivityId(UUID value) {
		return value == null ? null : new ActivityId(value);
	}

	default UUID fromActivityId(ActivityId value) {
		return value == null ? null : value.value();
	}

	default ActivityOwner toOwner(CreateActivityRequest.Owner value) {
		if (value == null) return null;
		return ActivityOwner.of(value.ownerUserId(), value.assignedTeamId());
	}

	default ActivityOwner toOwner(UpdateActivityRequest.Owner value) {
		if (value == null) return null;
		return ActivityOwner.of(value.ownerUserId(), value.assignedTeamId());
	}

	default ActivityResponse.Owner toResponseOwner(ActivityOwner value) {
		if (value == null) return null;
		return new ActivityResponse.Owner(value.ownerUserId(), value.assignedTeamId());
	}

	default ActivitySummaryResponse.Owner toSummaryResponseOwner(ActivityOwner value) {
		if (value == null) return null;
		return new ActivitySummaryResponse.Owner(value.ownerUserId(), value.assignedTeamId());
	}

	default ActivitySearchQuery toSearchQuery(ActivitySearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new ActivitySearchQuery(
				request.q(), request.activityType(),
				request.status(), request.priority(),
				request.ownerUserId(), request.assignedTeamId(),
				request.from(), request.to(),
				new PageQuery(page, size));
	}

	default PageResult<ActivitySummaryResponse> toSummaryPage(
			PageResult<ActivitySummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
