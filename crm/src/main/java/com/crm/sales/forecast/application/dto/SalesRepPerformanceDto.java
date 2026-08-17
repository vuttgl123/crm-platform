package com.crm.sales.forecast.application.dto;

public record SalesRepPerformanceDto(
		String repName,
		Double closedAmount,
		Double openAmount,
		Double targetQuota,
		Double quotaAttainmentPercent,
		Integer wonDealsCount,
		Integer lostDealsCount
) {}
