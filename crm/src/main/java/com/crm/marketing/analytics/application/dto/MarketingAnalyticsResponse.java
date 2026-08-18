package com.crm.marketing.analytics.application.dto;

import java.util.List;

public record MarketingAnalyticsResponse(
		MarketingRoiSummary summary,
		List<ChannelPerformance> channelPerformances,
		List<MarketingFunnelStage> funnelStages
) {}
