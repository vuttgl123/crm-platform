package com.crm.audit.application.service;

import java.util.Objects;
import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.port.AuditEventRepository;
import com.crm.audit.application.port.DataAccessEventRepository;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.application.usecase.AuditFacade;
import com.crm.audit.domain.AuditEvent;
import com.crm.audit.domain.AuditErrorCode;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditApplicationService implements AuditFacade {

	private static final String ENTITY_TYPE = "AUDIT";

	private final AuditEventRepository auditEventRepository;
	private final DataAccessEventRepository dataAccessEventRepository;
	private final CurrentTenant currentTenant;
	private final TenantAccessAuthorizer authorizer;

	public AuditApplicationService(
			AuditEventRepository auditEventRepository,
			DataAccessEventRepository dataAccessEventRepository,
			CurrentTenant currentTenant,
			TenantAccessAuthorizer authorizer) {
		this.auditEventRepository = auditEventRepository;
		this.dataAccessEventRepository = dataAccessEventRepository;
		this.currentTenant = currentTenant;
		this.authorizer = authorizer;
	}

	@Override
	@Transactional(readOnly = true)
	public AuditEvent getAuditEvent(UUID eventId) {
		Objects.requireNonNull(eventId, "eventId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.AUDIT_READ, ENTITY_TYPE);

		return auditEventRepository.findById(tenantId, eventId)
				.orElseThrow(() -> new DomainResourceNotFound(
						AuditErrorCode.AUDIT_EVENT_NOT_FOUND));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<AuditEventSummary> searchAuditEvents(AuditEventSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.AUDIT_READ, ENTITY_TYPE);

		return auditEventRepository.search(tenantId, query);
	}

	@Override
	@Transactional(readOnly = true)
	public DataAccessEvent getDataAccessEvent(UUID eventId) {
		Objects.requireNonNull(eventId, "eventId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.AUDIT_READ, ENTITY_TYPE);

		return dataAccessEventRepository.findById(tenantId, eventId)
				.orElseThrow(() -> new DomainResourceNotFound(
						AuditErrorCode.DATA_ACCESS_EVENT_NOT_FOUND));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<DataAccessEventSummary> searchDataAccessEvents(DataAccessEventSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.AUDIT_READ, ENTITY_TYPE);

		return dataAccessEventRepository.search(tenantId, query);
	}

}
