package com.crm.audit.application.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.crm.audit.application.command.PurgeAuditLogsCommand;
import com.crm.audit.application.command.RecordAuditEventCommand;
import com.crm.audit.application.command.RecordDataAccessEventCommand;
import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.dto.AuditStatsDto;
import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.port.AuditEventRepository;
import com.crm.audit.application.port.DataAccessEventRepository;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.application.usecase.AuditFacade;
import com.crm.audit.domain.ActorType;
import com.crm.audit.domain.AuditEvent;
import com.crm.audit.domain.AuditErrorCode;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
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
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public AuditApplicationService(
			AuditEventRepository auditEventRepository,
			DataAccessEventRepository dataAccessEventRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.auditEventRepository = auditEventRepository;
		this.dataAccessEventRepository = dataAccessEventRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
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

	@Override
	@Transactional(readOnly = true)
	public AuditStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.AUDIT_READ, ENTITY_TYPE);

		Instant now = timeProvider.now();
		Instant last24Hours = now.minus(24, ChronoUnit.HOURS);

		long totalAuditEvents = auditEventRepository.countEvents(tenantId);
		long dataAccessEvents = dataAccessEventRepository.countEvents(tenantId);
		long mutationEvents = totalAuditEvents;
		long distinctActors = Math.max(
				auditEventRepository.countDistinctActors(tenantId),
				dataAccessEventRepository.countDistinctActors(tenantId)
		);
		long eventsLast24h = auditEventRepository.countEventsSince(tenantId, last24Hours)
				+ dataAccessEventRepository.countEventsSince(tenantId, last24Hours);

		return new AuditStatsDto(
				totalAuditEvents,
				mutationEvents,
				dataAccessEvents,
				distinctActors,
				eventsLast24h
		);
	}

	@Override
	@Transactional
	public AuditEvent recordAuditEvent(RecordAuditEventCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.getActorId().orElse(null);
		authorizer.authorize(SystemPermission.PLATFORM_SECURITY_MANAGE, ENTITY_TYPE);

		Instant now = timeProvider.now();
		UUID eventId = identifierGenerator.nextId();

		AuditEvent event = new AuditEvent(
				tenantId,
				now,
				eventId,
				command.schemaName(),
				command.tableName(),
				command.aggregateType(),
				command.aggregateId(),
				command.action(),
				command.changedFields(),
				command.oldValues(),
				command.newValues(),
				actorId,
				ActorType.USER,
				command.requestId(),
				command.correlationId(),
				command.sourceIp(),
				command.userAgent(),
				command.applicationName()
		);

		auditEventRepository.save(event);
		return event;
	}

	@Override
	@Transactional
	public DataAccessEvent recordDataAccessEvent(RecordDataAccessEventCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.getActorId().orElse(null);
		authorizer.authorize(SystemPermission.PLATFORM_SECURITY_MANAGE, ENTITY_TYPE);

		Instant now = timeProvider.now();
		UUID eventId = identifierGenerator.nextId();

		DataAccessEvent event = new DataAccessEvent(
				tenantId,
				now,
				eventId,
				command.entityType(),
				command.entityId(),
				command.accessType(),
				command.fieldsAccessed(),
				actorId,
				ActorType.USER,
				command.purpose(),
				command.legalBasis(),
				command.requestId(),
				command.sourceIp(),
				command.userAgent(),
				command.metadata()
		);

		dataAccessEventRepository.save(event);
		return event;
	}

	@Override
	@Transactional
	public Map<String, Object> purgeAuditLogs(PurgeAuditLogsCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.authorize(SystemPermission.PLATFORM_SECURITY_MANAGE, ENTITY_TYPE);

		int purgedAudit = 0;
		int purgedDataAccess = 0;
		String type = command.logType() != null ? command.logType().toUpperCase() : "ALL";

		if ("ALL".equals(type) || "AUDIT_EVENTS".equals(type)) {
			purgedAudit = auditEventRepository.purgeOlderThan(tenantId, command.olderThan());
		}
		if ("ALL".equals(type) || "DATA_ACCESS".equals(type)) {
			purgedDataAccess = dataAccessEventRepository.purgeOlderThan(tenantId, command.olderThan());
		}

		Map<String, Object> result = new HashMap<>();
		result.put("purgedAuditEvents", purgedAudit);
		result.put("purgedDataAccessEvents", purgedDataAccess);
		result.put("totalPurged", purgedAudit + purgedDataAccess);
		result.put("olderThan", command.olderThan().toString());
		return result;
	}

}
