package com.crm.audit.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.domain.AuditEvent;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface AuditEventRepository {

	Optional<AuditEvent> findById(TenantId tenantId, UUID eventId);

	PageResult<AuditEventSummary> search(TenantId tenantId,
			AuditEventSearchQuery query);

}
