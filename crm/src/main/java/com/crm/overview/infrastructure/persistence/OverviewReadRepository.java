package com.crm.overview.infrastructure.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.overview.application.dto.DueActivity;
import com.crm.overview.application.dto.LifecycleCount;
import com.crm.overview.application.dto.OpportunityHighlight;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/**
 * The three questions the overview asks that the sales forecast cannot answer:
 * how the customer base is distributed across lifecycle stages, which open
 * opportunities are largest, and what is due today.
 *
 * <p>Every statement carries exactly one {@link OwnershipScopeSql}, which is the
 * contract that class documents.
 */
@Repository
public class OverviewReadRepository {

	/** Team ownership column on {@code crm_activities}, which is not the default. */
	private static final String ACTIVITY_TEAM_COLUMN = "assigned_team_id";

	/** Matches the DECIMAL(20,6) money columns so amounts agree with the forecast API. */
	private static final int MONEY_SCALE = 6;

	private final JdbcClient jdbcClient;

	public OverviewReadRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public TenantDefaults resolveTenantDefaults(TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT default_currency_code, default_timezone
				FROM platform_tenants
				WHERE id = :tenantId
				""")
				.param("tenantId", tenantId.toString())
				.query((ResultSet rs, int rowNum) -> new TenantDefaults(
						rs.getString("default_currency_code"),
						rs.getString("default_timezone")))
				.optional()
				.orElse(new TenantDefaults("USD", "UTC"));
	}

	/**
	 * Won revenue between two dates. Used for both the selected period and the
	 * preceding one, so that the delta compares two figures produced by the same
	 * definition rather than two definitions that merely look alike.
	 */
	public ClosedWonTotals closedWon(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access, String currencyCode,
			String fromDate, String toDate) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = baseParameters(scope, tenantId);
		parameters.put("currencyCode", currencyCode);
		parameters.put("fromDate", fromDate);
		parameters.put("toDate", toDate);

		String sql = scope.cte() + """
				SELECT COALESCE(SUM(o.amount), 0) AS total_amount,
				       COUNT(o.id) AS opportunity_count
				FROM crm_opportunities o
				JOIN crm_pipeline_stages s
				  ON s.tenant_id = o.tenant_id AND s.id = o.current_stage_id
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND o.currency_code = :currencyCode
				  AND o.status = 'WON'
				  AND s.stage_category = 'WON'
				  AND s.forecast_category = 'CLOSED'
				  AND o.actual_close_date BETWEEN :fromDate AND :toDate
				  AND (%s)
				""".formatted(scope.predicate("o"));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((ResultSet rs, int rowNum) -> new ClosedWonTotals(
						money(rs.getBigDecimal("total_amount")),
						rs.getLong("opportunity_count")))
				.single();
	}

	/**
	 * Account counts per lifecycle stage. Stages with no accounts do not appear
	 * in the result; the caller pads them.
	 */
	public List<LifecycleCount> lifecycleMix(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = baseParameters(scope, tenantId);

		String sql = scope.cte() + """
				SELECT a.lifecycle_stage, COUNT(*) AS account_count
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.deleted_at IS NULL
				  AND (%s)
				GROUP BY a.lifecycle_stage
				""".formatted(scope.predicate("a"));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((ResultSet rs, int rowNum) -> new LifecycleCount(
						rs.getString("lifecycle_stage"),
						rs.getLong("account_count")))
				.list();
	}

	/** The largest open opportunities in one currency. */
	public List<OpportunityHighlight> topOpenOpportunities(TenantId tenantId,
			ActorId actorId, AuthorizedDataAccess access,
			String currencyCode, int limit) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = baseParameters(scope, tenantId);
		parameters.put("currencyCode", currencyCode);
		parameters.put("rowLimit", limit);

		String sql = scope.cte() + """
				SELECT o.id,
				       o.name,
				       o.amount,
				       o.currency_code,
				       o.probability,
				       o.expected_close_date,
				       a.display_name AS account_name,
				       s.name AS stage_name,
				       u.display_name AS owner_name
				FROM crm_opportunities o
				JOIN crm_accounts a
				  ON a.tenant_id = o.tenant_id AND a.id = o.account_id
				 AND a.deleted_at IS NULL
				JOIN crm_pipeline_stages s
				  ON s.tenant_id = o.tenant_id AND s.id = o.current_stage_id
				LEFT JOIN platform_users u ON u.id = o.owner_user_id
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND o.currency_code = :currencyCode
				  AND o.status = 'OPEN'
				  AND s.stage_category = 'OPEN'
				  AND (%s)
				ORDER BY o.amount DESC, o.id
				LIMIT :rowLimit
				""".formatted(scope.predicate("o"));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((ResultSet rs, int rowNum) -> new OpportunityHighlight(
						uuid(rs.getString("id")),
						rs.getString("name"),
						rs.getString("account_name"),
						rs.getString("stage_name"),
						rs.getString("owner_name"),
						money(rs.getBigDecimal("amount")).toPlainString(),
						rs.getString("currency_code"),
						percent(rs.getBigDecimal("probability")),
						rs.getString("expected_close_date")))
				.list();
	}

	/**
	 * Exact counts of open activities that started before today, and those
	 * starting later today.
	 */
	public DueActivityCounts dueActivityCounts(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access, Instant startOfToday, Instant endOfToday) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = activityParameters(scope, tenantId,
				startOfToday, endOfToday);

		String sql = scope.cte() + """
				SELECT SUM(CASE WHEN act.scheduled_start_at < :startOfToday
				                THEN 1 ELSE 0 END) AS overdue_count,
				       SUM(CASE WHEN act.scheduled_start_at >= :startOfToday
				                THEN 1 ELSE 0 END) AS due_today_count
				FROM crm_activities act
				WHERE %s
				""".formatted(activityCriteria(scope));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((ResultSet rs, int rowNum) -> new DueActivityCounts(
						rs.getLong("overdue_count"),
						rs.getLong("due_today_count")))
				.single();
	}

	/** The soonest open activities, oldest first so overdue work leads. */
	public List<DueActivity> dueActivities(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access, Instant startOfToday,
			Instant endOfToday, int limit) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = activityParameters(scope, tenantId,
				startOfToday, endOfToday);
		parameters.put("rowLimit", limit);

		String sql = scope.cte() + """
				SELECT act.id,
				       act.subject,
				       act.activity_type,
				       act.priority,
				       act.status,
				       act.scheduled_start_at,
				       (SELECT a.display_name
				          FROM crm_activity_links l
				          JOIN crm_accounts a
				            ON a.tenant_id = l.tenant_id AND a.id = l.account_id
				         WHERE l.tenant_id = act.tenant_id
				           AND l.activity_id = act.id
				           AND l.account_id IS NOT NULL
				         ORDER BY l.created_at
				         LIMIT 1) AS account_name
				FROM crm_activities act
				WHERE %s
				ORDER BY act.scheduled_start_at, act.id
				LIMIT :rowLimit
				""".formatted(activityCriteria(scope));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((ResultSet rs, int rowNum) -> {
					Timestamp scheduledStartAt = rs.getTimestamp("scheduled_start_at");
					Instant startsAt = scheduledStartAt == null
							? null : scheduledStartAt.toInstant();
					return new DueActivity(
							uuid(rs.getString("id")),
							rs.getString("subject"),
							rs.getString("activity_type"),
							rs.getString("priority"),
							rs.getString("status"),
							startsAt == null ? null : startsAt.toString(),
							rs.getString("account_name"),
							startsAt != null && startsAt.isBefore(startOfToday));
				})
				.list();
	}

	/**
	 * Shared by the count and list statements so the two can never drift apart
	 * and report a count the list contradicts.
	 */
	private static String activityCriteria(OwnershipScopeSql scope) {
		return """
				act.tenant_id = :tenantId
				  AND act.deleted_at IS NULL
				  AND act.status IN ('PLANNED', 'IN_PROGRESS')
				  AND act.scheduled_start_at IS NOT NULL
				  AND act.scheduled_start_at < :endOfToday
				  AND (%s)
				""".formatted(scope.predicate("act", ACTIVITY_TEAM_COLUMN));
	}

	private static Map<String, Object> activityParameters(OwnershipScopeSql scope,
			TenantId tenantId, Instant startOfToday, Instant endOfToday) {
		Map<String, Object> parameters = baseParameters(scope, tenantId);
		parameters.put("startOfToday", Timestamp.from(startOfToday));
		parameters.put("endOfToday", Timestamp.from(endOfToday));
		return parameters;
	}

	private static Map<String, Object> baseParameters(OwnershipScopeSql scope,
			TenantId tenantId) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		return parameters;
	}

	private static BigDecimal money(BigDecimal value) {
		return value == null
				? BigDecimal.ZERO.setScale(MONEY_SCALE)
				: value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	private static Double percent(BigDecimal value) {
		return value == null ? null : value.doubleValue();
	}

	private static UUID uuid(String value) {
		return value == null || value.isBlank()
				? null : UUID.fromString(value.trim());
	}

}
