package com.crm.audit.application.query;

import java.time.Instant;
import java.util.UUID;

import com.crm.audit.domain.AuditAction;
import com.crm.sharedkernel.application.PageQuery;

public record AuditEventSearchQuery(
		String search,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		UUID actorUserId,
		Instant fromTime,
		Instant toTime,
		PageQuery pageQuery) {
}
