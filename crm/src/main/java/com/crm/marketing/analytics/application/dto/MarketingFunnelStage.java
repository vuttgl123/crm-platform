package com.crm.marketing.analytics.application.dto;

import java.math.BigDecimal;

public record MarketingFunnelStage(
		int stageOrder,
		String stageKey,
		String stageNameVi,
		long count,
		BigDecimal totalValue,
		double conversionRateFromPrevious,
		double dropoffRate
) {}
