package com.crm.customer.activity.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.application.query.ActivitySearchQuery;
import com.crm.customer.activity.domain.Activity;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface ActivityRepository {

	Optional<Activity> findById(TenantId tenantId, ActivityId activityId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<ActivitySummary> search(TenantId tenantId,
			ActorId actorId, ActivitySearchQuery query,
			AuthorizedDataAccess access);

	boolean existsUser(TenantId tenantId, UUID userId);

	boolean existsTeam(TenantId tenantId, UUID teamId);

	void save(Activity activity);

	void delete(TenantId tenantId, ActivityId activityId);

}
