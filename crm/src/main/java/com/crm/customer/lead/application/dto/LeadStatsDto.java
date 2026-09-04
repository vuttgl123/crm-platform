package com.crm.customer.lead.application.dto;

public record LeadStatsDto(
		long totalLeads,
		long uncontactedLeads,
		long workingLeads,
		long qualifiedLeads,
		long convertedLeads,
		double conversionRatePercentage
) {}
