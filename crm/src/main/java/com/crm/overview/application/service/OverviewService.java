package com.crm.overview.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.security.ResolvedDataScope;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.overview.application.dto.CustomerBaseBlock;
import com.crm.overview.application.dto.DueActivity;
import com.crm.overview.application.dto.FunnelBlock;
import com.crm.overview.application.dto.FunnelStage;
import com.crm.overview.application.dto.LeaderboardBlock;
import com.crm.overview.application.dto.LeaderboardEntry;
import com.crm.overview.application.dto.LifecycleCount;
import com.crm.overview.application.dto.MyDayBlock;
import com.crm.overview.application.dto.OpportunityHighlight;
import com.crm.overview.application.dto.OverviewPeriod;
import com.crm.overview.application.dto.OverviewResponse;
import com.crm.overview.application.dto.RevenueBlock;
import com.crm.overview.application.dto.TopOpportunitiesBlock;
import com.crm.overview.infrastructure.persistence.ClosedWonTotals;
import com.crm.overview.infrastructure.persistence.DueActivityCounts;
import com.crm.overview.infrastructure.persistence.OverviewReadRepository;
import com.crm.overview.infrastructure.persistence.TenantDefaults;
import com.crm.sales.forecast.application.dto.ForecastBreakdownResponse;
import com.crm.sales.forecast.application.dto.ForecastBreakdownRow;
import com.crm.sales.forecast.application.dto.ForecastCategoryMetric;
import com.crm.sales.forecast.application.dto.ForecastCurrencySummary;
import com.crm.sales.forecast.application.dto.ForecastPeriodContext;
import com.crm.sales.forecast.application.dto.SalesForecastSummaryResponse;
import com.crm.sales.forecast.application.service.ForecastPeriodResolver;
import com.crm.sales.forecast.application.service.SalesForecastService;
import com.crm.sales.forecast.domain.ForecastBreakdownDimension;
import com.crm.sales.forecast.domain.ForecastCategory;
import com.crm.sales.forecast.domain.ForecastPeriodPreset;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Assembles the overview screen from the sales forecast and three overview-only
 * queries.
 *
 * <p>The service owns no domain of its own. It composes existing reads, gates
 * each block on the actor's access, and never throws when a block is out of
 * reach - an unreachable block simply comes back {@code null}.
 */
@Service
@Transactional(readOnly = true)
public class OverviewService {

	private static final int TOP_OPPORTUNITY_LIMIT = 10;
	private static final int DUE_ACTIVITY_LIMIT = 10;
	private static final int LEADERBOARD_LIMIT = 10;

	/** Generous enough to hold every stage of every pipeline in one page. */
	private static final int FUNNEL_PAGE_SIZE = 100;

	private static final String ZERO_AMOUNT = "0.000000";

	/**
	 * Lifecycle stages in progression order rather than the order the schema
	 * happens to declare them, so the reader sees a funnel rather than a list.
	 */
	private static final List<String> LIFECYCLE_ORDER = List.of(
			"PROSPECT", "QUALIFIED", "CUSTOMER", "INACTIVE", "CHURNED");

	private static final String CHURNED = "CHURNED";

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final OverviewAccessResolver accessResolver;
	private final ForecastPeriodResolver periodResolver;
	private final SalesForecastService forecastService;
	private final OverviewReadRepository readRepository;

	public OverviewService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			OverviewAccessResolver accessResolver,
			ForecastPeriodResolver periodResolver,
			SalesForecastService forecastService,
			OverviewReadRepository readRepository
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.accessResolver = accessResolver;
		this.periodResolver = periodResolver;
		this.forecastService = forecastService;
		this.readRepository = readRepository;
	}

	public OverviewResponse getOverview(ForecastPeriodPreset preset) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();

		TenantDefaults defaults = readRepository.resolveTenantDefaults(tenantId);
		ForecastPeriodContext period = periodResolver.resolve(preset, defaults.timezone());
		DateRange previous = previousRangeOf(period);
		String currencyCode = defaults.currencyCode();

		Optional<AuthorizedDataAccess> opportunityAccess = accessResolver.resolve(
				SystemPermission.CRM_OPPORTUNITY_READ, "OPPORTUNITY");
		Optional<AuthorizedDataAccess> accountAccess = accessResolver.resolve(
				SystemPermission.CRM_ACCOUNT_READ, "ACCOUNT");
		Optional<AuthorizedDataAccess> activityAccess = accessResolver.resolve(
				SystemPermission.CRM_ACTIVITY_READ, "ACTIVITY");

		RevenueBlock revenue = opportunityAccess
				.map(access -> buildRevenue(tenantId, actorId, access,
						period, previous, currencyCode))
				.orElse(null);

		FunnelBlock funnel = opportunityAccess
				.map(access -> buildFunnel(period.preset(), currencyCode))
				.orElse(null);

		TopOpportunitiesBlock topOpportunities = opportunityAccess
				.map(access -> buildTopOpportunities(tenantId, actorId, access,
						currencyCode))
				.orElse(null);

		LeaderboardBlock leaderboard = opportunityAccess
				.filter(OverviewService::rankingIsMeaningful)
				.map(access -> buildLeaderboard(period.preset(), currencyCode))
				.orElse(null);

		CustomerBaseBlock customerBase = accountAccess
				.map(access -> buildCustomerBase(tenantId, actorId, access))
				.orElse(null);

		MyDayBlock myDay = activityAccess
				.map(access -> buildMyDay(tenantId, actorId, access,
						period.timezone()))
				.orElse(null);

		OverviewPeriod periodDto = new OverviewPeriod(
				period.preset(),
				period.fromDate(),
				period.toDate(),
				previous.fromDate(),
				previous.toDate(),
				period.timezone());

		return new OverviewResponse(
				periodDto,
				Instant.now().toString(),
				revenue,
				funnel,
				topOpportunities,
				leaderboard,
				customerBase,
				myDay);
	}

	private RevenueBlock buildRevenue(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access, ForecastPeriodContext period,
			DateRange previous, String currencyCode) {
		ClosedWonTotals current = readRepository.closedWon(tenantId, actorId,
				access, currencyCode, period.fromDate(), period.toDate());
		ClosedWonTotals prior = readRepository.closedWon(tenantId, actorId,
				access, currencyCode, previous.fromDate(), previous.toDate());

		SalesForecastSummaryResponse summary = forecastService.getSummary(
				period.preset(), null, null, null, currencyCode);
		ForecastCurrencySummary group = summary.currencyGroups().stream()
				.filter(candidate -> currencyCode.equalsIgnoreCase(candidate.currencyCode()))
				.findFirst()
				.orElse(null);

		return new RevenueBlock(
				currencyCode,
				current.amount().toPlainString(),
				prior.amount().toPlainString(),
				changePercent(current.amount(), prior.amount()),
				current.count(),
				group == null ? ZERO_AMOUNT : group.openPipelineAmount(),
				group == null ? ZERO_AMOUNT : group.weightedForecastAmount(),
				group == null ? 0L : group.eligibleOpportunityCount());
	}

	private FunnelBlock buildFunnel(ForecastPeriodPreset preset, String currencyCode) {
		ForecastBreakdownResponse breakdown = forecastService.getBreakdown(
				preset, ForecastBreakdownDimension.STAGE, currencyCode,
				null, null, null, 0, FUNNEL_PAGE_SIZE);

		List<FunnelStage> stages = new ArrayList<>();
		for (ForecastBreakdownRow row : breakdown.items()) {
			stages.add(new FunnelStage(
					row.subject().id(),
					row.subject().label(),
					row.subject().pipelineName(),
					row.subject().displayOrder(),
					row.subject().stageCategory(),
					row.openPipelineAmount(),
					row.opportunityCount()));
		}
		stages.sort((left, right) -> Integer.compare(
				left.displayOrder() == null ? Integer.MAX_VALUE : left.displayOrder(),
				right.displayOrder() == null ? Integer.MAX_VALUE : right.displayOrder()));

		return new FunnelBlock(currencyCode, List.copyOf(stages));
	}

	private LeaderboardBlock buildLeaderboard(ForecastPeriodPreset preset,
			String currencyCode) {
		ForecastBreakdownResponse breakdown = forecastService.getBreakdown(
				preset, ForecastBreakdownDimension.OWNER, currencyCode,
				null, null, null, 0, LEADERBOARD_LIMIT);

		List<LeaderboardEntry> entries = new ArrayList<>();
		for (ForecastBreakdownRow row : breakdown.items()) {
			entries.add(new LeaderboardEntry(
					row.subject().kind(),
					row.subject().id(),
					row.subject().label(),
					closedAmountOf(row),
					row.openPipelineAmount(),
					row.weightedForecastAmount(),
					row.opportunityCount()));
		}
		return new LeaderboardBlock(currencyCode, List.copyOf(entries));
	}

	private TopOpportunitiesBlock buildTopOpportunities(TenantId tenantId,
			ActorId actorId, AuthorizedDataAccess access, String currencyCode) {
		List<OpportunityHighlight> items = readRepository.topOpenOpportunities(
				tenantId, actorId, access, currencyCode, TOP_OPPORTUNITY_LIMIT);
		return new TopOpportunitiesBlock(currencyCode, items);
	}

	private CustomerBaseBlock buildCustomerBase(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access) {
		Map<String, Long> counts = new LinkedHashMap<>();
		for (String stage : LIFECYCLE_ORDER) {
			counts.put(stage, 0L);
		}
		long total = 0L;
		for (LifecycleCount row : readRepository.lifecycleMix(tenantId, actorId, access)) {
			counts.merge(row.lifecycleStage(), row.accountCount(), Long::sum);
			total += row.accountCount();
		}

		List<LifecycleCount> stages = new ArrayList<>();
		for (Map.Entry<String, Long> entry : counts.entrySet()) {
			stages.add(new LifecycleCount(entry.getKey(), entry.getValue()));
		}

		Double churnedShare = total == 0L ? null : BigDecimal
				.valueOf(counts.getOrDefault(CHURNED, 0L))
				.multiply(BigDecimal.valueOf(100))
				.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
				.doubleValue();

		return new CustomerBaseBlock(total, List.copyOf(stages), churnedShare);
	}

	private MyDayBlock buildMyDay(TenantId tenantId, ActorId actorId,
			AuthorizedDataAccess access, String timezone) {
		ZoneId zone = zoneOf(timezone);
		LocalDate today = LocalDate.now(zone);
		Instant startOfToday = today.atStartOfDay(zone).toInstant();
		Instant endOfToday = today.plusDays(1).atStartOfDay(zone).toInstant();

		DueActivityCounts counts = readRepository.dueActivityCounts(
				tenantId, actorId, access, startOfToday, endOfToday);
		List<DueActivity> items = readRepository.dueActivities(
				tenantId, actorId, access, startOfToday, endOfToday,
				DUE_ACTIVITY_LIMIT);

		return new MyDayBlock(counts.overdueCount(), counts.dueTodayCount(), items);
	}

	/**
	 * A leaderboard is only worth rendering when the reader can see more than
	 * their own records; ranking a list of one tells them nothing.
	 */
	private static boolean rankingIsMeaningful(AuthorizedDataAccess access) {
		for (ResolvedDataScope scope : access.scopes()) {
			if (scope.type() != null && scope.type() != DataScopeType.OWN) {
				return true;
			}
		}
		return false;
	}

	private static String closedAmountOf(ForecastBreakdownRow row) {
		for (ForecastCategoryMetric metric : row.categories()) {
			if (metric.category() == ForecastCategory.CLOSED) {
				return metric.amount();
			}
		}
		return ZERO_AMOUNT;
	}

	/**
	 * Growth against a period that closed nothing is undefined rather than
	 * infinite, so it is reported as absent instead of as a number.
	 */
	private static Double changePercent(BigDecimal current, BigDecimal previous) {
		if (previous == null || previous.signum() == 0) {
			return null;
		}
		return current.subtract(previous)
				.multiply(BigDecimal.valueOf(100))
				.divide(previous, 2, RoundingMode.HALF_UP)
				.doubleValue();
	}

	/**
	 * The window of equal length immediately before the selected one. The end is
	 * always the day before the selected window opens; only the length varies.
	 */
	private static DateRange previousRangeOf(ForecastPeriodContext period) {
		LocalDate from = LocalDate.parse(period.fromDate());
		LocalDate previousTo = from.minusDays(1);
		LocalDate previousFrom = switch (period.preset()) {
			case THIS_QUARTER -> from.minusMonths(3);
			case THIS_YEAR -> from.minusYears(1);
			case THIS_MONTH -> from.minusMonths(1);
		};
		return new DateRange(previousFrom.toString(), previousTo.toString());
	}

	private static ZoneId zoneOf(String timezone) {
		try {
			return timezone == null || timezone.isBlank()
					? ZoneId.of("UTC") : ZoneId.of(timezone);
		} catch (Exception e) {
			return ZoneId.of("UTC");
		}
	}

	private record DateRange(String fromDate, String toDate) {
	}

}
