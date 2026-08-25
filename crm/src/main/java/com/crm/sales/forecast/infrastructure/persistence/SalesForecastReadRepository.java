package com.crm.sales.forecast.infrastructure.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.forecast.application.dto.AppliedForecastFilters;
import com.crm.sales.forecast.application.dto.ForecastBreakdownResponse;
import com.crm.sales.forecast.application.dto.ForecastBreakdownRow;
import com.crm.sales.forecast.application.dto.ForecastBreakdownSubject;
import com.crm.sales.forecast.application.dto.ForecastCategoryMetric;
import com.crm.sales.forecast.application.dto.ForecastCurrencySummary;
import com.crm.sales.forecast.application.dto.ForecastOwnerFilterDto;
import com.crm.sales.forecast.application.dto.ForecastPeriodContext;
import com.crm.sales.forecast.application.dto.ForecastQualityMetric;
import com.crm.sales.forecast.application.dto.SalesForecastSummaryResponse;
import com.crm.sales.forecast.domain.ForecastBreakdownDimension;
import com.crm.sales.forecast.domain.ForecastCategory;
import com.crm.sales.forecast.domain.ForecastQualityCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class SalesForecastReadRepository {

	private final JdbcClient jdbcClient;

	public SalesForecastReadRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public SalesForecastSummaryResponse getSummary(
			TenantId tenantId,
			ActorId actorId,
			AuthorizedDataAccess access,
			ForecastPeriodContext period,
			UUID pipelineId,
			String ownerType,
			UUID ownerId,
			String currencyCode
	) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> params = new HashMap<>(scope.parameters());
		params.put("tenantId", tenantId.value());
		params.put("fromDate", period.fromDate());
		params.put("toDate", period.toDate());

		StringBuilder filters = new StringBuilder();
		if (pipelineId != null) {
			filters.append(" AND o.pipeline_id = :pipelineId");
			params.put("pipelineId", pipelineId.toString());
		}
		if (ownerType != null && ownerId != null) {
			if ("USER".equalsIgnoreCase(ownerType)) {
				filters.append(" AND o.owner_user_id = :ownerId");
			} else {
				filters.append(" AND o.owner_team_id = :ownerId");
			}
			params.put("ownerId", ownerId.toString());
		}
		if (currencyCode != null && !currencyCode.isBlank()) {
			filters.append(" AND o.currency_code = :currencyCode");
			params.put("currencyCode", currencyCode.toUpperCase().trim());
		}

		// 1. Fetch eligible category rollups
		String categorySql = scope.cte() + """
				SELECT o.currency_code,
				       s.forecast_category,
				       SUM(o.amount) AS total_amount,
				       COUNT(o.id) AS opp_count,
				       SUM(CASE
				           WHEN o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE')
				                THEN (o.amount * o.probability / 100.0)
				           WHEN o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED'
				                THEN o.amount
				           ELSE 0
				       END) AS weighted_amount
				FROM crm_opportunities o
				JOIN crm_pipeline_stages s ON o.current_stage_id = s.id AND s.tenant_id = o.tenant_id AND s.deleted_at IS NULL
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND (%s)
				  %s
				  AND (
				      (o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED' AND o.actual_close_date BETWEEN :fromDate AND :toDate)
				      OR
				      (o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED') AND o.expected_close_date BETWEEN :fromDate AND :toDate)
				  )
				GROUP BY o.currency_code, s.forecast_category
				""".formatted(scope.predicate("o"), filters);

		List<Map<String, Object>> categoryRows = jdbcClient.sql(categorySql).params(params).query().listOfRows();

		// 2. Fetch Data Quality Metrics
		// UNSCHEDULED (open, non-deleted, in-scope, expected_close_date null, within filters excluding period)
		String unscheduledSql = scope.cte() + """
				SELECT o.currency_code,
				       SUM(o.amount) AS total_amount,
				       COUNT(o.id) AS opp_count
				FROM crm_opportunities o
				JOIN crm_pipeline_stages s ON o.current_stage_id = s.id AND s.tenant_id = o.tenant_id AND s.deleted_at IS NULL
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND (%s)
				  %s
				  AND o.status = 'OPEN'
				  AND s.stage_category = 'OPEN'
				  AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED')
				  AND o.expected_close_date IS NULL
				GROUP BY o.currency_code
				""".formatted(scope.predicate("o"), filters);

		List<Map<String, Object>> unscheduledRows = jdbcClient.sql(unscheduledSql).params(params).query().listOfRows();

		// STATUS_STAGE_CONFLICT
		String conflictSql = scope.cte() + """
				SELECT o.currency_code,
				       SUM(o.amount) AS total_amount,
				       COUNT(o.id) AS opp_count
				FROM crm_opportunities o
				JOIN crm_pipeline_stages s ON o.current_stage_id = s.id AND s.tenant_id = o.tenant_id AND s.deleted_at IS NULL
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND (%s)
				  %s
				  AND (
				      (o.status = 'OPEN' AND (s.stage_category IN ('WON', 'LOST') OR s.forecast_category = 'CLOSED'))
				      OR (o.status = 'WON' AND (s.stage_category <> 'WON' OR s.forecast_category <> 'CLOSED'))
				      OR (o.status = 'LOST' AND s.stage_category <> 'LOST')
				  )
				GROUP BY o.currency_code
				""".formatted(scope.predicate("o"), filters);

		List<Map<String, Object>> conflictRows = jdbcClient.sql(conflictSql).params(params).query().listOfRows();

		// MISSING_OWNER
		String missingOwnerSql = scope.cte() + """
				SELECT o.currency_code,
				       SUM(o.amount) AS total_amount,
				       COUNT(o.id) AS opp_count
				FROM crm_opportunities o
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND (%s)
				  %s
				  AND o.owner_user_id IS NULL
				  AND o.owner_team_id IS NULL
				GROUP BY o.currency_code
				""".formatted(scope.predicate("o"), filters);

		List<Map<String, Object>> missingOwnerRows = jdbcClient.sql(missingOwnerSql).params(params).query().listOfRows();

		// Collect all encountered currency codes
		Set<String> allCurrencies = new HashSet<>();
		for (Map<String, Object> r : categoryRows) {
			if (r.get("currency_code") != null) allCurrencies.add(r.get("currency_code").toString());
		}
		for (Map<String, Object> r : unscheduledRows) {
			if (r.get("currency_code") != null) allCurrencies.add(r.get("currency_code").toString());
		}
		for (Map<String, Object> r : conflictRows) {
			if (r.get("currency_code") != null) allCurrencies.add(r.get("currency_code").toString());
		}
		for (Map<String, Object> r : missingOwnerRows) {
			if (r.get("currency_code") != null) allCurrencies.add(r.get("currency_code").toString());
		}

		if (currencyCode != null && !currencyCode.isBlank()) {
			allCurrencies.add(currencyCode.toUpperCase().trim());
		}

		List<String> sortedCurrencies = new ArrayList<>(allCurrencies);
		Collections.sort(sortedCurrencies);

		List<ForecastCurrencySummary> currencySummaries = new ArrayList<>();

		for (String curr : sortedCurrencies) {
			BigDecimal weightedForecast = BigDecimal.ZERO;
			BigDecimal openPipeline = BigDecimal.ZERO;
			long eligibleCount = 0;

			Map<ForecastCategory, BigDecimal> catAmounts = new LinkedHashMap<>();
			Map<ForecastCategory, Long> catCounts = new LinkedHashMap<>();

			for (ForecastCategory fc : ForecastCategory.values()) {
				catAmounts.put(fc, BigDecimal.ZERO);
				catCounts.put(fc, 0L);
			}

			for (Map<String, Object> r : categoryRows) {
				if (curr.equalsIgnoreCase(String.valueOf(r.get("currency_code")))) {
					String catStr = String.valueOf(r.get("forecast_category"));
					try {
						ForecastCategory fc = ForecastCategory.valueOf(catStr);
						BigDecimal amt = toBigDecimal(r.get("total_amount"));
						long cnt = toLong(r.get("opp_count"));
						BigDecimal weighted = toBigDecimal(r.get("weighted_amount"));

						catAmounts.put(fc, amt);
						catCounts.put(fc, cnt);

						weightedForecast = weightedForecast.add(weighted);
						eligibleCount += cnt;

						if (fc == ForecastCategory.PIPELINE || fc == ForecastCategory.BEST_CASE || fc == ForecastCategory.COMMIT) {
							openPipeline = openPipeline.add(amt);
						}
					} catch (Exception ignored) {
					}
				}
			}

			List<ForecastCategoryMetric> categoryMetrics = new ArrayList<>();
			// Order: CLOSED, COMMIT, BEST_CASE, PIPELINE, OMITTED
			List<ForecastCategory> canonicalOrder = List.of(
					ForecastCategory.CLOSED,
					ForecastCategory.COMMIT,
					ForecastCategory.BEST_CASE,
					ForecastCategory.PIPELINE,
					ForecastCategory.OMITTED
			);

			for (ForecastCategory fc : canonicalOrder) {
				categoryMetrics.add(new ForecastCategoryMetric(
						fc,
						formatAmount(catAmounts.get(fc)),
						catCounts.get(fc)
				));
			}

			// Quality metrics for this currency
			List<ForecastQualityMetric> qualityMetrics = new ArrayList<>();

			// Unscheduled
			BigDecimal unscheduledAmt = BigDecimal.ZERO;
			long unscheduledCnt = 0;
			for (Map<String, Object> r : unscheduledRows) {
				if (curr.equalsIgnoreCase(String.valueOf(r.get("currency_code")))) {
					unscheduledAmt = toBigDecimal(r.get("total_amount"));
					unscheduledCnt = toLong(r.get("opp_count"));
				}
			}
			qualityMetrics.add(new ForecastQualityMetric(
					ForecastQualityCode.UNSCHEDULED,
					formatAmount(unscheduledAmt),
					unscheduledCnt,
					"FILTERS_EXCLUDING_PERIOD"
			));

			// Conflict
			BigDecimal conflictAmt = BigDecimal.ZERO;
			long conflictCnt = 0;
			for (Map<String, Object> r : conflictRows) {
				if (curr.equalsIgnoreCase(String.valueOf(r.get("currency_code")))) {
					conflictAmt = toBigDecimal(r.get("total_amount"));
					conflictCnt = toLong(r.get("opp_count"));
				}
			}
			qualityMetrics.add(new ForecastQualityMetric(
					ForecastQualityCode.STATUS_STAGE_CONFLICT,
					formatAmount(conflictAmt),
					conflictCnt,
					"SELECTED_PERIOD"
			));

			// Missing owner
			BigDecimal missingOwnerAmt = BigDecimal.ZERO;
			long missingOwnerCnt = 0;
			for (Map<String, Object> r : missingOwnerRows) {
				if (curr.equalsIgnoreCase(String.valueOf(r.get("currency_code")))) {
					missingOwnerAmt = toBigDecimal(r.get("total_amount"));
					missingOwnerCnt = toLong(r.get("opp_count"));
				}
			}
			qualityMetrics.add(new ForecastQualityMetric(
					ForecastQualityCode.MISSING_OWNER,
					formatAmount(missingOwnerAmt),
					missingOwnerCnt,
					"SELECTED_PERIOD"
			));

			currencySummaries.add(new ForecastCurrencySummary(
					curr,
					formatAmount(weightedForecast),
					formatAmount(openPipeline),
					eligibleCount,
					categoryMetrics,
					qualityMetrics
			));
		}

		// Applied filters
		ForecastOwnerFilterDto ownerDto = null;
		if (ownerType != null && ownerId != null) {
			ownerDto = new ForecastOwnerFilterDto(ownerType.toUpperCase(), ownerId, ownerId.toString());
		}

		AppliedForecastFilters applied = new AppliedForecastFilters(
				pipelineId,
				ownerDto,
				currencyCode != null && !currencyCode.isBlank() ? currencyCode.toUpperCase().trim() : null
		);

		return new SalesForecastSummaryResponse(
				period,
				applied,
				"USD",
				Instant.now().toString(),
				currencySummaries
		);
	}

	public ForecastBreakdownResponse getBreakdown(
			TenantId tenantId,
			ActorId actorId,
			AuthorizedDataAccess access,
			ForecastPeriodContext period,
			ForecastBreakdownDimension dimension,
			String currencyCode,
			UUID pipelineId,
			String ownerType,
			UUID ownerId,
			int page,
			int size
	) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> params = new HashMap<>(scope.parameters());
		params.put("tenantId", tenantId.value());
		params.put("fromDate", period.fromDate());
		params.put("toDate", period.toDate());
		params.put("currencyCode", currencyCode.toUpperCase().trim());

		StringBuilder filters = new StringBuilder();
		if (pipelineId != null) {
			filters.append(" AND o.pipeline_id = :pipelineId");
			params.put("pipelineId", pipelineId.toString());
		}
		if (ownerType != null && ownerId != null) {
			if ("USER".equalsIgnoreCase(ownerType)) {
				filters.append(" AND o.owner_user_id = :ownerId");
			} else {
				filters.append(" AND o.owner_team_id = :ownerId");
			}
			params.put("ownerId", ownerId.toString());
		}

		int limit = Math.max(1, Math.min(100, size));
		int offset = Math.max(0, page) * limit;
		params.put("limit", limit);
		params.put("offset", offset);

		List<ForecastBreakdownRow> rows = new ArrayList<>();
		long totalElements = 0;

		if (dimension == ForecastBreakdownDimension.STAGE) {
			String countSql = scope.cte() + """
					SELECT COUNT(DISTINCT s.id)
					FROM crm_pipeline_stages s
					JOIN crm_pipelines p ON s.pipeline_id = p.id AND p.tenant_id = s.tenant_id AND p.deleted_at IS NULL
					WHERE s.tenant_id = :tenantId
					  AND s.deleted_at IS NULL
					""";
			if (pipelineId != null) {
				countSql += " AND s.pipeline_id = :pipelineId";
			}

			totalElements = jdbcClient.sql(countSql).params(params).query(Long.class).single();

			String stageSql = scope.cte() + """
					SELECT s.id AS stage_id,
					       s.name AS stage_name,
					       s.display_order,
					       s.stage_category,
					       s.forecast_category,
					       p.id AS pipeline_id,
					       p.name AS pipeline_name,
					       COALESCE(SUM(o.amount), 0) AS total_amount,
					       COUNT(o.id) AS opp_count,
					       COALESCE(SUM(CASE
					           WHEN o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE')
					                THEN (o.amount * o.probability / 100.0)
					           WHEN o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED'
					                THEN o.amount
					           ELSE 0
					       END), 0) AS weighted_amount
					FROM crm_pipeline_stages s
					JOIN crm_pipelines p ON s.pipeline_id = p.id AND p.tenant_id = s.tenant_id AND p.deleted_at IS NULL
					LEFT JOIN crm_opportunities o ON o.current_stage_id = s.id
					                             AND o.tenant_id = s.tenant_id
					                             AND o.deleted_at IS NULL
					                             AND o.currency_code = :currencyCode
					                             AND (%s)
					                             %s
					                             AND (
					                                 (o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED' AND o.actual_close_date BETWEEN :fromDate AND :toDate)
					                                 OR
					                                 (o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED') AND o.expected_close_date BETWEEN :fromDate AND :toDate)
					                             )
					WHERE s.tenant_id = :tenantId
					  AND s.deleted_at IS NULL
					  %s
					GROUP BY s.id, s.name, s.display_order, s.stage_category, s.forecast_category, p.id, p.name
					ORDER BY p.name ASC, s.display_order ASC
					LIMIT :limit OFFSET :offset
					""".formatted(scope.predicate("o"), filters, pipelineId != null ? "AND s.pipeline_id = :pipelineId" : "");

			List<Map<String, Object>> stageList = jdbcClient.sql(stageSql).params(params).query().listOfRows();

			for (Map<String, Object> r : stageList) {
				UUID stageId = (UUID) r.get("stage_id");
				String stageName = String.valueOf(r.get("stage_name"));
				UUID pId = (UUID) r.get("pipeline_id");
				String pName = String.valueOf(r.get("pipeline_name"));
				Integer displayOrder = r.get("display_order") != null ? ((Number) r.get("display_order")).intValue() : 0;
				String stgCat = r.get("stage_category") != null ? String.valueOf(r.get("stage_category")) : "OPEN";
				String fcCatStr = r.get("forecast_category") != null ? String.valueOf(r.get("forecast_category")) : "PIPELINE";
				ForecastCategory fc = ForecastCategory.PIPELINE;
				try {
					fc = ForecastCategory.valueOf(fcCatStr);
				} catch (Exception ignored) {
				}

				BigDecimal amt = toBigDecimal(r.get("total_amount"));
				long cnt = toLong(r.get("opp_count"));
				BigDecimal weighted = toBigDecimal(r.get("weighted_amount"));

				BigDecimal openPipe = (fc == ForecastCategory.PIPELINE || fc == ForecastCategory.BEST_CASE || fc == ForecastCategory.COMMIT) ? amt : BigDecimal.ZERO;

				ForecastBreakdownSubject subject = new ForecastBreakdownSubject(
						"STAGE",
						stageId,
						stageName,
						pId,
						pName,
						displayOrder,
						stgCat,
						fc
				);

				List<ForecastCategoryMetric> cats = List.of(
						new ForecastCategoryMetric(fc, formatAmount(amt), cnt)
				);

				rows.add(new ForecastBreakdownRow(
						subject,
						currencyCode,
						formatAmount(weighted),
						formatAmount(openPipe),
						cnt,
						cats
				));
			}

		} else {
			// OWNER dimension
			String countSql = scope.cte() + """
					SELECT COUNT(DISTINCT COALESCE(o.owner_user_id, o.owner_team_id, '00000000-0000-0000-0000-000000000000'))
					FROM crm_opportunities o
					JOIN crm_pipeline_stages s ON o.current_stage_id = s.id AND s.tenant_id = o.tenant_id AND s.deleted_at IS NULL
					WHERE o.tenant_id = :tenantId
					  AND o.deleted_at IS NULL
					  AND o.currency_code = :currencyCode
					  AND (%s)
					  %s
					  AND (
					      (o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED' AND o.actual_close_date BETWEEN :fromDate AND :toDate)
					      OR
					      (o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED') AND o.expected_close_date BETWEEN :fromDate AND :toDate)
					  )
					""".formatted(scope.predicate("o"), filters);

			totalElements = jdbcClient.sql(countSql).params(params).query(Long.class).single();

			String ownerSql = scope.cte() + """
					SELECT o.owner_user_id,
					       o.owner_team_id,
					       u.display_name AS user_name,
					       t.name AS team_name,
					       SUM(o.amount) AS total_amount,
					       COUNT(o.id) AS opp_count,
					       SUM(CASE
					           WHEN o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE')
					                THEN (o.amount * o.probability / 100.0)
					           WHEN o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED'
					                THEN o.amount
					           ELSE 0
					       END) AS weighted_amount,
					       SUM(CASE WHEN s.forecast_category = 'CLOSED' THEN o.amount ELSE 0 END) AS closed_amount,
					       COUNT(CASE WHEN s.forecast_category = 'CLOSED' THEN o.id ELSE NULL END) AS closed_count,
					       SUM(CASE WHEN s.forecast_category = 'COMMIT' THEN o.amount ELSE 0 END) AS commit_amount,
					       COUNT(CASE WHEN s.forecast_category = 'COMMIT' THEN o.id ELSE NULL END) AS commit_count,
					       SUM(CASE WHEN s.forecast_category = 'BEST_CASE' THEN o.amount ELSE 0 END) AS best_case_amount,
					       COUNT(CASE WHEN s.forecast_category = 'BEST_CASE' THEN o.id ELSE NULL END) AS best_case_count,
					       SUM(CASE WHEN s.forecast_category = 'PIPELINE' THEN o.amount ELSE 0 END) AS pipeline_amount,
					       COUNT(CASE WHEN s.forecast_category = 'PIPELINE' THEN o.id ELSE NULL END) AS pipeline_count,
					       SUM(CASE WHEN s.forecast_category = 'OMITTED' THEN o.amount ELSE 0 END) AS omitted_amount,
					       COUNT(CASE WHEN s.forecast_category = 'OMITTED' THEN o.id ELSE NULL END) AS omitted_count
					FROM crm_opportunities o
					JOIN crm_pipeline_stages s ON o.current_stage_id = s.id AND s.tenant_id = o.tenant_id AND s.deleted_at IS NULL
					LEFT JOIN platform.users u ON u.id = o.owner_user_id
					LEFT JOIN platform.teams t ON t.id = o.owner_team_id
					WHERE o.tenant_id = :tenantId
					  AND o.deleted_at IS NULL
					  AND o.currency_code = :currencyCode
					  AND (%s)
					  %s
					  AND (
					      (o.status = 'WON' AND s.stage_category = 'WON' AND s.forecast_category = 'CLOSED' AND o.actual_close_date BETWEEN :fromDate AND :toDate)
					      OR
					      (o.status = 'OPEN' AND s.stage_category = 'OPEN' AND s.forecast_category IN ('COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED') AND o.expected_close_date BETWEEN :fromDate AND :toDate)
					  )
					GROUP BY o.owner_user_id, o.owner_team_id, u.display_name, t.name
					ORDER BY weighted_amount DESC, total_amount DESC
					LIMIT :limit OFFSET :offset
					""".formatted(scope.predicate("o"), filters);

			List<Map<String, Object>> ownerList = jdbcClient.sql(ownerSql).params(params).query().listOfRows();

			for (Map<String, Object> r : ownerList) {
				UUID uId = (UUID) r.get("owner_user_id");
				UUID tId = (UUID) r.get("owner_team_id");
				String uName = r.get("user_name") != null ? String.valueOf(r.get("user_name")) : null;
				String tName = r.get("team_name") != null ? String.valueOf(r.get("team_name")) : null;

				String kind;
				UUID id;
				String label;

				if (uId != null) {
					kind = "USER";
					id = uId;
					label = uName != null ? uName : "User (" + uId.toString().substring(0, 8) + ")";
				} else if (tId != null) {
					kind = "TEAM";
					id = tId;
					label = tName != null ? tName : "Team (" + tId.toString().substring(0, 8) + ")";
				} else {
					kind = "UNASSIGNED";
					id = null;
					label = "Unassigned";
				}

				ForecastBreakdownSubject subject = new ForecastBreakdownSubject(
						kind,
						id,
						label,
						null,
						null,
						null,
						null,
						null
				);

				BigDecimal weighted = toBigDecimal(r.get("weighted_amount"));
				BigDecimal closedAmt = toBigDecimal(r.get("closed_amount"));
				long closedCnt = toLong(r.get("closed_count"));
				BigDecimal commitAmt = toBigDecimal(r.get("commit_amount"));
				long commitCnt = toLong(r.get("commit_count"));
				BigDecimal bestCaseAmt = toBigDecimal(r.get("best_case_amount"));
				long bestCaseCnt = toLong(r.get("best_case_count"));
				BigDecimal pipelineAmt = toBigDecimal(r.get("pipeline_amount"));
				long pipelineCnt = toLong(r.get("pipeline_count"));
				BigDecimal omittedAmt = toBigDecimal(r.get("omitted_amount"));
				long omittedCnt = toLong(r.get("omitted_count"));

				BigDecimal openPipe = commitAmt.add(bestCaseAmt).add(pipelineAmt);
				long totalCnt = toLong(r.get("opp_count"));

				List<ForecastCategoryMetric> cats = List.of(
						new ForecastCategoryMetric(ForecastCategory.CLOSED, formatAmount(closedAmt), closedCnt),
						new ForecastCategoryMetric(ForecastCategory.COMMIT, formatAmount(commitAmt), commitCnt),
						new ForecastCategoryMetric(ForecastCategory.BEST_CASE, formatAmount(bestCaseAmt), bestCaseCnt),
						new ForecastCategoryMetric(ForecastCategory.PIPELINE, formatAmount(pipelineAmt), pipelineCnt),
						new ForecastCategoryMetric(ForecastCategory.OMITTED, formatAmount(omittedAmt), omittedCnt)
				);

				rows.add(new ForecastBreakdownRow(
						subject,
						currencyCode,
						formatAmount(weighted),
						formatAmount(openPipe),
						totalCnt,
						cats
				));
			}
		}

		int totalPages = (int) Math.ceil((double) totalElements / limit);

		ForecastOwnerFilterDto ownerDto = null;
		if (ownerType != null && ownerId != null) {
			ownerDto = new ForecastOwnerFilterDto(ownerType.toUpperCase(), ownerId, ownerId.toString());
		}

		AppliedForecastFilters applied = new AppliedForecastFilters(
				pipelineId,
				ownerDto,
				currencyCode
		);

		return new ForecastBreakdownResponse(
				dimension,
				period,
				applied,
				currencyCode,
				rows,
				page,
				limit,
				totalElements,
				totalPages,
				Instant.now().toString()
		);
	}

	private static BigDecimal toBigDecimal(Object val) {
		if (val == null) return BigDecimal.ZERO;
		if (val instanceof BigDecimal bd) return bd;
		if (val instanceof Number num) return BigDecimal.valueOf(num.doubleValue());
		try {
			return new BigDecimal(val.toString());
		} catch (Exception e) {
			return BigDecimal.ZERO;
		}
	}

	private static long toLong(Object val) {
		if (val == null) return 0L;
		if (val instanceof Number num) return num.longValue();
		try {
			return Long.parseLong(val.toString());
		} catch (Exception e) {
			return 0L;
		}
	}

	private static String formatAmount(BigDecimal val) {
		if (val == null) return "0.000000";
		return val.setScale(6, RoundingMode.HALF_UP).toPlainString();
	}
}
