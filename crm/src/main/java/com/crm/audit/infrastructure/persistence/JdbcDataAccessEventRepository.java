package com.crm.audit.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.audit.application.dto.DataAccessEventSummary;
import com.crm.audit.application.port.DataAccessEventRepository;
import com.crm.audit.application.query.DataAccessEventSearchQuery;
import com.crm.audit.domain.DataAccessEvent;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDataAccessEventRepository implements DataAccessEventRepository, InitializingBean {

	private static final String EVENT_SELECT = """
			SELECT d.tenant_id, d.occurred_at, d.id, d.entity_type,
			       d.entity_id, d.access_type, d.fields_accessed,
			       d.actor_user_id, d.actor_type, d.purpose,
			       d.legal_basis, d.request_id, d.source_ip,
			       d.user_agent, d.metadata
			FROM audit_data_access_events d
			""";

	private static final String SUMMARY_SELECT = """
			SELECT d.id, d.occurred_at, d.entity_type, d.entity_id,
			       d.access_type, d.fields_accessed, d.actor_user_id,
			       d.actor_type, d.purpose, d.legal_basis,
			       d.source_ip, d.user_agent
			FROM audit_data_access_events d
			""";

	private final JdbcClient jdbcClient;

	public JdbcDataAccessEventRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public void afterPropertiesSet() {
		try {
			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS audit_data_access_events (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    occurred_at TIMESTAMP NOT NULL,
					    entity_type VARCHAR(128) NOT NULL,
					    entity_id VARCHAR(64),
					    access_type VARCHAR(32) NOT NULL,
					    fields_accessed TEXT,
					    actor_user_id VARCHAR(64),
					    actor_type VARCHAR(32) NOT NULL,
					    purpose TEXT,
					    legal_basis TEXT,
					    request_id VARCHAR(64),
					    source_ip VARCHAR(64),
					    user_agent VARCHAR(512),
					    metadata TEXT,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();
		} catch (Exception ignored) {}
	}

	@Override
	public Optional<DataAccessEvent> findById(TenantId tenantId, UUID eventId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"eventId", eventId.toString());
		String sql = EVENT_SELECT + """
				WHERE d.tenant_id = :tenantId
				  AND d.id = :eventId
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(DataAccessEventJdbcMapper::mapEvent)
				.optional();
	}

	@Override
	public PageResult<DataAccessEventSummary> search(TenantId tenantId,
			DataAccessEventSearchQuery query) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE d.tenant_id = :tenantId
				""");
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql("""
				SELECT COUNT(*)
				FROM audit_data_access_events d
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<DataAccessEventSummary> items = jdbcClient.sql(SUMMARY_SELECT
				+ criteria + """
				ORDER BY d.occurred_at DESC, d.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(DataAccessEventJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, DataAccessEventSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(d.entity_type) LIKE :searchPattern
					      OR LOWER(d.purpose) LIKE :searchPattern
					      OR LOWER(d.legal_basis) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.entityType() != null && !query.entityType().trim().isEmpty()) {
			criteria.append(" AND d.entity_type = :filterEntityType");
			parameters.put("filterEntityType", query.entityType().trim());
		}
		if (query.entityId() != null) {
			criteria.append(" AND d.entity_id = :filterEntityId");
			parameters.put("filterEntityId", query.entityId().toString());
		}
		if (query.accessType() != null) {
			criteria.append(" AND d.access_type = :filterAccessType");
			parameters.put("filterAccessType", query.accessType().name());
		}
		if (query.actorUserId() != null) {
			criteria.append(" AND d.actor_user_id = :filterActorUserId");
			parameters.put("filterActorUserId", query.actorUserId().toString());
		}
		if (query.fromTime() != null) {
			criteria.append(" AND d.occurred_at >= :filterFromTime");
			parameters.put("filterFromTime", Timestamp.from(query.fromTime()));
		}
		if (query.toTime() != null) {
			criteria.append(" AND d.occurred_at <= :filterToTime");
			parameters.put("filterToTime", Timestamp.from(query.toTime()));
		}
	}

	@Override
	public void save(DataAccessEvent event) {
		jdbcClient.sql("""
				INSERT INTO audit_data_access_events (
				    tenant_id, id, occurred_at, entity_type, entity_id,
				    access_type, fields_accessed, actor_user_id, actor_type,
				    purpose, legal_basis, request_id, source_ip, user_agent, metadata
				) VALUES (
				    :tenantId, :id, :occurredAt, :entityType, :entityId,
				    :accessType, :fieldsAccessed, :actorUserId, :actorType,
				    :purpose, :legalBasis, :requestId, :sourceIp, :userAgent, :metadata
				)
				""")
				.param("tenantId", event.tenantId().toString())
				.param("id", event.id().toString())
				.param("occurredAt", Timestamp.from(event.occurredAt()))
				.param("entityType", event.entityType())
				.param("entityId", event.entityId() != null ? event.entityId().toString() : null)
				.param("accessType", event.accessType().name())
				.param("fieldsAccessed", event.fieldsAccessed())
				.param("actorUserId", event.actorUserId() != null ? event.actorUserId().toString() : null)
				.param("actorType", event.actorType().name())
				.param("purpose", event.purpose())
				.param("legalBasis", event.legalBasis())
				.param("requestId", event.requestId() != null ? event.requestId().toString() : null)
				.param("sourceIp", event.sourceIp())
				.param("userAgent", event.userAgent())
				.param("metadata", event.metadata())
				.update();
	}

	@Override
	public long countEvents(TenantId tenantId) {
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM audit_data_access_events WHERE tenant_id = :t")
				.param("t", tenantId.toString())
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public long countEventsSince(TenantId tenantId, Instant since) {
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM audit_data_access_events WHERE tenant_id = :t AND occurred_at >= :since")
				.param("t", tenantId.toString())
				.param("since", Timestamp.from(since))
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public long countDistinctActors(TenantId tenantId) {
		Long count = jdbcClient.sql("SELECT COUNT(DISTINCT actor_user_id) FROM audit_data_access_events WHERE tenant_id = :t AND actor_user_id IS NOT NULL")
				.param("t", tenantId.toString())
				.query(Long.class)
				.single();
		return count != null ? count : 0;
	}

	@Override
	public int purgeOlderThan(TenantId tenantId, Instant threshold) {
		return jdbcClient.sql("DELETE FROM audit_data_access_events WHERE tenant_id = :t AND occurred_at < :thresh")
				.param("t", tenantId.toString())
				.param("thresh", Timestamp.from(threshold))
				.update();
	}

}
