package com.crm.sales.forecast.application.service;

import java.util.UUID;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sales.forecast.application.dto.ForecastBreakdownResponse;
import com.crm.sales.forecast.application.dto.ForecastPeriodContext;
import com.crm.sales.forecast.application.dto.SalesForecastSummaryResponse;
import com.crm.sales.forecast.domain.ForecastBreakdownDimension;
import com.crm.sales.forecast.domain.ForecastPeriodPreset;
import com.crm.sales.forecast.infrastructure.persistence.SalesForecastReadRepository;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SalesForecastService {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(SalesForecastService.class);

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final ForecastPeriodResolver periodResolver;
	private final SalesForecastReadRepository readRepository;
	private final JdbcClient jdbcClient;

	public SalesForecastService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			ForecastPeriodResolver periodResolver,
			SalesForecastReadRepository readRepository,
			JdbcClient jdbcClient
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.periodResolver = periodResolver;
		this.readRepository = readRepository;
		this.jdbcClient = jdbcClient;
	}

	public SalesForecastSummaryResponse getSummary(
			ForecastPeriodPreset period,
			UUID pipelineId,
			String ownerType,
			UUID ownerId,
			String currencyCode
	) {
		TenantId tenantId = currentTenant.requireTenantId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.CRM_OPPORTUNITY_READ, "OPPORTUNITY");
		ActorId actorId = currentActor.requireActorId();

		String timezone = resolveTenantTimezone(tenantId);
		ForecastPeriodContext periodContext = periodResolver.resolve(period, timezone);

		return readRepository.getSummary(
				tenantId,
				actorId,
				access,
				periodContext,
				pipelineId,
				ownerType,
				ownerId,
				currencyCode
		);
	}

	public ForecastBreakdownResponse getBreakdown(
			ForecastPeriodPreset period,
			ForecastBreakdownDimension dimension,
			String currencyCode,
			UUID pipelineId,
			String ownerType,
			UUID ownerId,
			int page,
			int size
	) {
		TenantId tenantId = currentTenant.requireTenantId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.CRM_OPPORTUNITY_READ, "OPPORTUNITY");
		ActorId actorId = currentActor.requireActorId();

		String timezone = resolveTenantTimezone(tenantId);
		ForecastPeriodContext periodContext = periodResolver.resolve(period, timezone);

		String selectedCurrency = (currencyCode != null && !currencyCode.isBlank()) ? currencyCode : "USD";
		ForecastBreakdownDimension selectedDimension = dimension != null ? dimension : ForecastBreakdownDimension.OWNER;

		return readRepository.getBreakdown(
				tenantId,
				actorId,
				access,
				periodContext,
				selectedDimension,
				selectedCurrency,
				pipelineId,
				ownerType,
				ownerId,
				page,
				size
		);
	}

	private String resolveTenantTimezone(TenantId tenantId) {
		try {
			return jdbcClient.sql("""
					SELECT default_timezone
					FROM platform_tenants
					WHERE id = :tenantId
					""")
					.param("tenantId", tenantId.value())
					.query(String.class)
					.optional()
					.orElse("UTC");
		} catch (DataAccessException e) {
			LOGGER.warn("Falling back to UTC: could not read the default timezone for tenant {}",
					tenantId.value(), e);
			return "UTC";
		}
	}
}
