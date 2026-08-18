package com.crm.sales.commission.application.dto;

import java.util.UUID;

public record SalesCommissionItemDto(
		UUID id,
		String salesRepName,
		String period,
		double totalClosedRevenue,
		double targetQuota,
		double quotaAttainmentPercent,
		double baseCommissionPercent,
		double baseCommissionAmount,
		double kickerBonusAmount,
		double totalPayoutAmount,
		String status,
		String approvedBy,
		String calculatedAt
) {}
