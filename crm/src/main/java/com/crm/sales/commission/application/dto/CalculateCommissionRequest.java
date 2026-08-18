package com.crm.sales.commission.application.dto;

public record CalculateCommissionRequest(
		String period,
		String salesRepName,
		Double targetQuota
) {}
