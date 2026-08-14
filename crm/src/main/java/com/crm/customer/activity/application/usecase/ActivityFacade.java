package com.crm.customer.activity.application.usecase;

import com.crm.customer.activity.application.command.CompleteActivityCommand;
import com.crm.customer.activity.application.command.CreateActivityCommand;
import com.crm.customer.activity.application.command.DeleteActivityCommand;
import com.crm.customer.activity.application.command.UpdateActivityCommand;
import com.crm.customer.activity.application.dto.ActivityDetails;
import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.application.query.ActivitySearchQuery;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.sharedkernel.application.PageResult;

public interface ActivityFacade {

	ActivityDetails create(CreateActivityCommand command);

	ActivityDetails get(ActivityId activityId);

	PageResult<ActivitySummary> search(ActivitySearchQuery query);

	ActivityDetails update(UpdateActivityCommand command);

	ActivityDetails complete(CompleteActivityCommand command);

	void delete(DeleteActivityCommand command);

}
