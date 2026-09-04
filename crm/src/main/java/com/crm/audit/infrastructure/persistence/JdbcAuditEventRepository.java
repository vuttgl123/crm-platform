package com.crm.audit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
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
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAuditEventRepository implements AuditEventRepository, InitializingBean {

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
	public void afterPropertiesSet() {
		try {
			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS audit_audit_events (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    occurred_at TIMESTAMP NOT NULL,
					    schema_name VARCHAR(128) NOT NULL,
					    table_name VARCHAR(128) NOT NULL,
					    aggregate_type VARCHAR(128) NOT NULL,
					    aggregate_id VARCHAR(64),
					    action VARCHAR(32) NOT NULL,
					    changed_fields TEXT,
					    old_values TEXT,
					    new_values TEXT,
					    actor_user_id VARCHAR(64),
					    actor_type VARCHAR(32) NOT NULL,
					    request_id VARCHAR(64),
					    correlation_id VARCHAR(64),
					    source_ip VARCHAR(64),
					    user_agent VARCHAR(512),
					    application_name VARCHAR(128),
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();
		} catch (Exception ignored) {}
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

	@Override
	public void save(AuditEvent event) {
		jdbcClient.sql("""
				INSERT INTO audit_audit_events (
				    tenant_id, id, occurred_at, schema_name, table_name,
				    aggregate_type, aggregate_id, action, changed_fields,
				    old_values, new_values, actor_user_id, actor_type,
				    request_id, correlation_id, source_ip, user_agent, application_name
				) VALUES (
				    :tenantId, :id, :occurredAt, :schemaName, :tableName,
				    :aggregateType, :aggregateId, :action, :changedFields,
				    :oldValues, :newValues, :actorUserId, :actorType,
				    :requestId, :correlationId, :sourceIp, :userAgent, :applicationName
				)
				""")
				.param("tenantId", event.tenantId().toString())
				.param("id", event.id().toString())
				.param("occurredAt", Timestamp.from(event.occurredAt()))
				.param("schemaName", event.schemaName())
				.param("tableName", event.tableName())
				.param("aggregateType", event.aggregateType())
				.param("aggregateId", event.aggregateId() != null ? event.aggregateId().toString() : null)
				.param("action", event.action().name())
				.param("changedFields", event.changedFields())
				.param("oldValues", event.oldValues())
				.param("newValues", event.newValues())
				.param("actorUserId", event.actorUserId() != null ? event.actorUserId().toString() : null)
				.param("actorType", event.actorType().name())
				.param("requestId", event.requestId() != null ? event.requestId().toString() : null)
				.param("correlationId", event.correlationId() != null ? event.correlationId().toString() : null)
				.param("sourceIp", event.sourceIp())
				.param("userAgent", event.userAgent())
				.param("applicationName", event.applicationName())
				.update();
	}

	@Override
	public long countEvents(TenantId tenantId) {
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM audit_audit_events WHERE tenant_id = :t")
				.param("t", tenantId.toString())
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public long countEventsSince(TenantId tenantId, Instant since) {
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM audit_audit_events WHERE tenant_id = :t AND occurred_at >= :since")
				.param("t", tenantId.toString())
				.param("since", Timestamp.from(since))
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public long countDistinctActors(TenantId tenantId) {
		Long count = jdbcClient.sql("SELECT COUNT(DISTINCT actor_user_id) FROM audit_audit_events WHERE tenant_id = :t AND actor_user_id IS NOT NULL")
				.param("t", tenantId.toString())
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public int purgeOlderThan(TenantId tenantId, Instant threshold) {
		return jdbcClient.sql("DELETE FROM audit_audit_events WHERE tenant_id = :t AND occurred_at < :thresh")
				.param("t", tenantId.toString())
				.param("thresh", Timestamp.from(threshold))
				.update();
	}

}
