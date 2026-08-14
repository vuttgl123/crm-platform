package com.crm.audit.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.audit.application.dto.AuditEventSummary;
import com.crm.audit.application.port.AuditEventRepository;
import com.crm.audit.application.query.AuditEventSearchQuery;
import com.crm.audit.domain.AuditEvent;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAuditEventRepository implements AuditEventRepository {

	private static final String EVENT_SELECT = """
			SELECT a.tenant_id, a.occurred_at, a.id, a.schema_name,
			       a.table_name, a.aggregate_type, a.aggregate_id,
			       a.action, a.changed_fields, a.old_values, a.new_values,
			       a.actor_user_id, a.actor_type, a.request_id,
			       a.correlation_id, a.source_ip, a.user_agent,
			       a.application_name
			FROM audit_audit_events a
			""";

	private static final String SUMMARY_SELECT = """
			SELECT a.id, a.occurred_at, a.schema_name, a.table_name,
			       a.aggregate_type, a.aggregate_id, a.action,
			       a.changed_fields, a.actor_user_id, a.actor_type,
			       a.source_ip, a.user_agent
			FROM audit_audit_events a
			""";

	private final JdbcClient jdbcClient;

	public JdbcAuditEventRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<AuditEvent> findById(TenantId tenantId, UUID eventId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"eventId", eventId.toString());
		String sql = EVENT_SELECT + """
				WHERE a.tenant_id = :tenantId
				  AND a.id = :eventId
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AuditEventJdbcMapper::mapEvent)
				.optional();
	}

	@Override
	public PageResult<AuditEventSummary> search(TenantId tenantId,
			AuditEventSearchQuery query) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE a.tenant_id = :tenantId
				""");
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql("""
				SELECT COUNT(*)
				FROM audit_audit_events a
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<AuditEventSummary> items = jdbcClient.sql(SUMMARY_SELECT
				+ criteria + """
				ORDER BY a.occurred_at DESC, a.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(AuditEventJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, AuditEventSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(a.schema_name) LIKE :searchPattern
					      OR LOWER(a.table_name) LIKE :searchPattern
					      OR LOWER(a.aggregate_type) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.aggregateType() != null && !query.aggregateType().trim().isEmpty()) {
			criteria.append(" AND a.aggregate_type = :filterAggregateType");
			parameters.put("filterAggregateType", query.aggregateType().trim());
		}
		if (query.aggregateId() != null) {
			criteria.append(" AND a.aggregate_id = :filterAggregateId");
			parameters.put("filterAggregateId", query.aggregateId().toString());
		}
		if (query.action() != null) {
			criteria.append(" AND a.action = :filterAction");
			parameters.put("filterAction", query.action().name());
		}
		if (query.actorUserId() != null) {
			criteria.append(" AND a.actor_user_id = :filterActorUserId");
			parameters.put("filterActorUserId", query.actorUserId().toString());
		}
		if (query.fromTime() != null) {
			criteria.append(" AND a.occurred_at >= :filterFromTime");
			parameters.put("filterFromTime", Timestamp.from(query.fromTime()));
		}
		if (query.toTime() != null) {
			criteria.append(" AND a.occurred_at <= :filterToTime");
			parameters.put("filterToTime", Timestamp.from(query.toTime()));
		}
	}

}
