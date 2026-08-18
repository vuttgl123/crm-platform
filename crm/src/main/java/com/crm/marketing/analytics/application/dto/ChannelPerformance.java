package com.crm.marketing.analytics.application.dto;

import java.math.BigDecimal;

public record ChannelPerformance(
		String channelType,
		String channelNameVi,
		int campaignsCount,
		BigDecimal spend,
		int leadsCount,
		int conversionsCount,
		BigDecimal wonRevenue,
		BigDecimal roiPercent,
		BigDecimal costPerLead
) {}
