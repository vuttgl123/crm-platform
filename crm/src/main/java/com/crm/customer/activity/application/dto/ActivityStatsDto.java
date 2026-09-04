package com.crm.customer.activity.application.dto;

public record ActivityStatsDto(
		long totalActivities,
		long dueTodayCount,
		long overdueCount,
		long completedCount,
		long callsCount,
		long meetingsCount,
		long tasksCount
) {}
