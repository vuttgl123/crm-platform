package com.crm.marketing.analytics.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.marketing.analytics.application.dto.ChannelPerformance;
import com.crm.marketing.analytics.application.dto.MarketingAnalyticsResponse;
import com.crm.marketing.analytics.application.dto.MarketingFunnelStage;
import com.crm.marketing.analytics.application.dto.MarketingRoiSummary;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class MarketingAnalyticsService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	public MarketingAnalyticsService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public MarketingAnalyticsResponse getFullAnalytics() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		MarketingRoiSummary summary = getRoiSummary();
		List<ChannelPerformance> channels = getChannelPerformance();
		List<MarketingFunnelStage> funnel = getFunnelStages();

		return new MarketingAnalyticsResponse(summary, channels, funnel);
	}

	public MarketingRoiSummary getRoiSummary() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		BigDecimal totalBudget = new BigDecimal("345000000");
		BigDecimal totalActualSpend = new BigDecimal("75000000");
		BigDecimal totalExpectedRevenue = new BigDecimal("5750000000");
		BigDecimal totalWonRevenue = new BigDecimal("1280000000");
		BigDecimal totalPipelineValue = new BigDecimal("3450000000");

		BigDecimal netProfit = totalWonRevenue.subtract(totalActualSpend);
		BigDecimal roi = totalActualSpend.compareTo(BigDecimal.ZERO) > 0
				? netProfit.multiply(new BigDecimal("100")).divide(totalActualSpend, 2, RoundingMode.HALF_UP)
				: BigDecimal.ZERO;

		int leads = 285;
		int deals = 37;
		BigDecimal cpl = totalActualSpend.divide(new BigDecimal(leads), 0, RoundingMode.HALF_UP);
		BigDecimal cac = totalActualSpend.divide(new BigDecimal(deals), 0, RoundingMode.HALF_UP);

		return new MarketingRoiSummary(
				totalBudget,
				totalActualSpend,
				totalExpectedRevenue,
				totalWonRevenue,
				totalPipelineValue,
				roi,
				4,
				2,
				leads,
				82,
				deals,
				cpl,
				cac
		);
	}

	public List<ChannelPerformance> getChannelPerformance() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		return List.of(
				new ChannelPerformance(
						"WEBINAR",
						"Hội thảo Trực tuyến (Webinar)",
						1,
						new BigDecimal("35000000"),
						142,
						18,
						new BigDecimal("550000000"),
						new BigDecimal("1471.43"),
						new BigDecimal("246479")
				),
				new ChannelPerformance(
						"SOCIAL_ADS",
						"Quảng cáo MXH (Meta / LinkedIn)",
						1,
						new BigDecimal("28000000"),
						89,
						7,
						new BigDecimal("420000000"),
						new BigDecimal("1400.00"),
						new BigDecimal("314607")
				),
				new ChannelPerformance(
						"EMAIL",
						"Email Marketing & Nuôi dưỡng",
						1,
						new BigDecimal("12000000"),
						54,
						12,
						new BigDecimal("310000000"),
						new BigDecimal("2483.33"),
						new BigDecimal("222222")
				),
				new ChannelPerformance(
						"EVENT",
						"Triển lãm & Sự kiện Offline",
						1,
						new BigDecimal("0"),
						0,
						0,
						new BigDecimal("0"),
						new BigDecimal("0"),
						new BigDecimal("0")
				)
		);
	}

	public List<MarketingFunnelStage> getFunnelStages() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		return List.of(
				new MarketingFunnelStage(1, "IMPRESSIONS", "Lượt tiếp cận / Impression", 48500, BigDecimal.ZERO, 100.0, 0.0),
				new MarketingFunnelStage(2, "CLICKS", "Lượt quan tâm / Clicks", 4200, BigDecimal.ZERO, 8.66, 91.34),
				new MarketingFunnelStage(3, "LEADS", "Khách hàng Tiềm năng (Leads)", 285, BigDecimal.ZERO, 6.79, 93.21),
				new MarketingFunnelStage(4, "MQL_QUALIFIED", "Lead Đạt chuẩn Tiếp thị (MQL)", 164, new BigDecimal("4800000000"), 57.54, 42.46),
				new MarketingFunnelStage(5, "OPPORTUNITIES", "Cơ hội Bán hàng (Opportunities)", 82, new BigDecimal("3450000000"), 50.0, 50.0),
				new MarketingFunnelStage(6, "CLOSED_WON", "Khách hàng Chốt hợp đồng (Won)", 37, new BigDecimal("1280000000"), 45.12, 54.88)
		);
	}
}
