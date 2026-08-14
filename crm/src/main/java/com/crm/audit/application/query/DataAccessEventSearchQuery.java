package com.crm.audit.application.query;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.DataAccessType;
import com.crm.sharedkernel.application.PageQuery;

public record DataAccessEventSearchQuery(
		String search,
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		UUID actorUserId,
		Instant fromTime,
		Instant toTime,
		PageQuery pageQuery) {
}
