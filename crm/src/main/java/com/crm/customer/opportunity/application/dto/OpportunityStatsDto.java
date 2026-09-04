package com.crm.customer.opportunity.application.dto;

import java.math.BigDecimal;

public record OpportunityStatsDto(
		long totalOpportunities,
		long openOpportunities,
		long wonOpportunities,
		long lostOpportunities,
		BigDecimal totalPipelineValue,
		BigDecimal weightedPipelineValue,
		BigDecimal wonRevenueTotal,
		double winRatePercentage,
		BigDecimal averageDealSize
) {}
