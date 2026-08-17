package com.crm.customer.health.application.dto;

import java.util.List;
import java.util.UUID;

public record CustomerHealthScoreDto(
		UUID accountId,
		Integer healthScore,
		String healthGrade,
		Integer activityScore,
		Integer ticketScore,
		Integer contractScore,
		Integer transactionScore,
		List<String> churnRiskFactors,
		String recommendedAction
) {}
