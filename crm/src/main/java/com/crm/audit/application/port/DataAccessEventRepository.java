package com.crm.audit.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface DataAccessEventRepository {

	Optional<DataAccessEvent> findById(TenantId tenantId, UUID eventId);

	PageResult<DataAccessEventSummary> search(TenantId tenantId,
			DataAccessEventSearchQuery query);

	void save(DataAccessEvent event);

	long countEvents(TenantId tenantId);

	long countEventsSince(TenantId tenantId, Instant since);

	long countDistinctActors(TenantId tenantId);

	int purgeOlderThan(TenantId tenantId, Instant threshold);

}
