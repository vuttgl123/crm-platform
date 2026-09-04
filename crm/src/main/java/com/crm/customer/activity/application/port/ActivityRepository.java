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

	com.crm.customer.activity.application.dto.ActivityStatsDto getStats(
			TenantId tenantId, ActorId actorId, AuthorizedDataAccess access);

	void reschedule(TenantId tenantId, ActivityId id, java.time.Instant startsAt,
			java.time.Instant dueAt, long expectedVersion, ActorId actorId, java.time.Instant now);

	void cancel(TenantId tenantId, ActivityId id, String cancelReason,
			long expectedVersion, ActorId actorId, java.time.Instant now);

	int bulkComplete(TenantId tenantId, java.util.List<ActivityId> ids, String outcomeCode,
			ActorId actorId, java.time.Instant now);

}
