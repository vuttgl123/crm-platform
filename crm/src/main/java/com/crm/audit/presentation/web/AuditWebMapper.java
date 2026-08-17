package com.crm.audit.presentation.web;

import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.domain.AuditEvent;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;

@Mapper(config = CrmMapperConfig.class)
public interface AuditWebMapper {

	AuditEventResponse toResponse(AuditEvent event);

	AuditEventSummaryResponse toSummaryResponse(AuditEventSummary summary);

	DataAccessEventResponse toResponse(DataAccessEvent event);

	DataAccessEventSummaryResponse toSummaryResponse(DataAccessEventSummary summary);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default AuditEventSearchQuery toSearchQuery(AuditEventSearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new AuditEventSearchQuery(
				request.q(), request.aggregateType(),
				request.aggregateId(), request.action(),
				request.actorUserId(), request.from(),
				request.to(), new PageQuery(page, size));
	}

	default DataAccessEventSearchQuery toSearchQuery(DataAccessEventSearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new DataAccessEventSearchQuery(
				request.q(), request.entityType(),
				request.entityId(), request.accessType(),
				request.actorUserId(), request.from(),
				request.to(), new PageQuery(page, size));
	}

	default PageResult<AuditEventSummaryResponse> toAuditEventSummaryPage(
			PageResult<AuditEventSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

	default PageResult<DataAccessEventSummaryResponse> toDataAccessEventSummaryPage(
			PageResult<DataAccessEventSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
