package com.crm.customer.activity.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.application.port.ActivityRepository;
import com.crm.customer.activity.application.query.ActivitySearchQuery;
import com.crm.customer.activity.domain.Activity;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcActivityRepository implements ActivityRepository {

	private static final String ACTIVITY_SELECT = """
			SELECT a.tenant_id, a.id, a.activity_type, a.subject,
			       a.description, a.direction, a.status, a.priority,
			       a.owner_user_id, a.assigned_team_id, a.scheduled_start_at,
			       a.scheduled_end_at, a.completed_at, a.duration_seconds,
			       a.outcome_code, a.external_reference, a.recurrence_rule,
			       a.created_at, a.created_by, a.updated_at, a.updated_by, a.version
			FROM crm_activities a
			""";

	private static final String SUMMARY_SELECT = """
			SELECT a.id, a.activity_type, a.subject, a.direction,
			       a.status, a.priority, a.owner_user_id, a.assigned_team_id,
			       a.scheduled_start_at, a.scheduled_end_at, a.completed_at,
			       a.updated_at, a.version
			FROM crm_activities a
			""";

	private final JdbcClient jdbcClient;

	public JdbcActivityRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Activity> findById(TenantId tenantId, ActivityId activityId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("activityId", activityId.toString());
		String sql = scope.cte() + ACTIVITY_SELECT + """
				WHERE a.tenant_id = :tenantId
				  AND a.id = :activityId
				  AND a.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(ActivityJdbcMapper::mapActivity)
				.optional();
	}

	@Override
	public PageResult<ActivitySummary> search(TenantId tenantId,
			ActorId actorId, ActivitySearchQuery query,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE a.tenant_id = :tenantId
				  AND a.deleted_at IS NULL
				""");
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_activities a
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<ActivitySummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY a.updated_at DESC, a.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(ActivityJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsUser(TenantId tenantId, UUID userId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"userId", userId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId
				  AND user_id = :userId
				  AND membership_status = 'ACTIVE'
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsTeam(TenantId tenantId, UUID teamId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"teamId", teamId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM platform_teams
				WHERE tenant_id = :tenantId
				  AND id = :teamId
				  AND deleted_at IS NULL
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public void save(Activity activity) {
		Objects.requireNonNull(activity, "activity must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", activity.tenantId().toString());
		parameters.put("id", activity.id().toString());
		parameters.put("activityType", activity.activityType().name());
		parameters.put("subject", activity.subject());
		parameters.put("description", activity.description());
		parameters.put("direction", activity.direction() == null ? null : activity.direction().name());
		parameters.put("status", activity.status().name());
		parameters.put("priority", activity.priority().name());
		parameters.put("ownerUserId", activity.owner().ownerUserId() == null ? null : activity.owner().ownerUserId().toString());
		parameters.put("assignedTeamId", activity.owner().assignedTeamId() == null ? null : activity.owner().assignedTeamId().toString());
		parameters.put("scheduledStartAt", activity.scheduledStartAt() == null ? null : Timestamp.from(activity.scheduledStartAt()));
		parameters.put("scheduledEndAt", activity.scheduledEndAt() == null ? null : Timestamp.from(activity.scheduledEndAt()));
		parameters.put("completedAt", activity.completedAt() == null ? null : Timestamp.from(activity.completedAt()));
		parameters.put("durationSeconds", activity.durationSeconds());
		parameters.put("outcomeCode", activity.outcomeCode());
		parameters.put("externalReference", activity.externalReference());
		parameters.put("recurrenceRule", activity.recurrenceRule());
		parameters.put("createdAt", Timestamp.from(activity.createdAt()));
		parameters.put("createdBy", activity.createdBy() == null ? null : activity.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(activity.updatedAt()));
		parameters.put("updatedBy", activity.updatedBy() == null ? null : activity.updatedBy().toString());
		parameters.put("version", activity.version());

		String sql = """
				INSERT INTO crm_activities (
				    tenant_id, id, activity_type, subject, description,
				    direction, status, priority, owner_user_id, assigned_team_id,
				    scheduled_start_at, scheduled_end_at, completed_at,
				    duration_seconds, outcome_code, external_reference,
				    recurrence_rule, created_at, created_by, updated_at,
				    updated_by, version
				) VALUES (
				    :tenantId, :id, :activityType, :subject, :description,
				    :direction, :status, :priority, :ownerUserId, :assignedTeamId,
				    :scheduledStartAt, :scheduledEndAt, :completedAt,
				    :durationSeconds, :outcomeCode, :externalReference,
				    :recurrenceRule, :createdAt, :createdBy, :updatedAt,
				    :updatedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    activity_type = VALUES(activity_type),
				    subject = VALUES(subject),
				    description = VALUES(description),
				    direction = VALUES(direction),
				    status = VALUES(status),
				    priority = VALUES(priority),
				    owner_user_id = VALUES(owner_user_id),
				    assigned_team_id = VALUES(assigned_team_id),
				    scheduled_start_at = VALUES(scheduled_start_at),
				    scheduled_end_at = VALUES(scheduled_end_at),
				    completed_at = VALUES(completed_at),
				    duration_seconds = VALUES(duration_seconds),
				    outcome_code = VALUES(outcome_code),
				    external_reference = VALUES(external_reference),
				    recurrence_rule = VALUES(recurrence_rule),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	@Override
	public void delete(TenantId tenantId, ActivityId activityId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"activityId", activityId.toString());
		String sql = """
				UPDATE crm_activities
				SET deleted_at = CURRENT_TIMESTAMP(6)
				WHERE tenant_id = :tenantId AND id = :activityId AND deleted_at IS NULL
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, ActivitySearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(a.subject) LIKE :searchPattern
					      OR LOWER(a.description) LIKE :searchPattern
					      OR LOWER(a.outcome_code) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.activityType() != null) {
			criteria.append(" AND a.activity_type = :filterActivityType");
			parameters.put("filterActivityType", query.activityType().name());
		}
		if (query.status() != null) {
			criteria.append(" AND a.status = :filterStatus");
			parameters.put("filterStatus", query.status().name());
		}
		if (query.priority() != null) {
			criteria.append(" AND a.priority = :filterPriority");
			parameters.put("filterPriority", query.priority().name());
		}
		if (query.ownerUserId() != null) {
			criteria.append(" AND a.owner_user_id = :filterOwnerUserId");
			parameters.put("filterOwnerUserId", query.ownerUserId().toString());
		}
		if (query.assignedTeamId() != null) {
			criteria.append(" AND a.assigned_team_id = :filterAssignedTeamId");
			parameters.put("filterAssignedTeamId", query.assignedTeamId().toString());
		}
		if (query.fromTime() != null) {
			criteria.append(" AND a.scheduled_start_at >= :filterFromTime");
			parameters.put("filterFromTime", Timestamp.from(query.fromTime()));
		}
		if (query.toTime() != null) {
			criteria.append(" AND a.scheduled_start_at <= :filterToTime");
			parameters.put("filterToTime", Timestamp.from(query.toTime()));
		}
	}

}
