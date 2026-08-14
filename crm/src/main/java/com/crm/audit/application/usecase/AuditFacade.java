package com.crm.audit.application.usecase;

import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.domain.AuditEvent;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.sharedkernel.application.PageResult;

public interface AuditFacade {

	AuditEvent getAuditEvent(UUID eventId);

	PageResult<AuditEventSummary> searchAuditEvents(AuditEventSearchQuery query);

	DataAccessEvent getDataAccessEvent(UUID eventId);

	PageResult<DataAccessEventSummary> searchDataAccessEvents(DataAccessEventSearchQuery query);

}
