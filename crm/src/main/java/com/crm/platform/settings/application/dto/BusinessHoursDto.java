package com.crm.platform.settings.application.dto;

import java.util.List;

public record BusinessHoursDto(
		String timezone,
		List<String> workDays, // ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
		String startTime, // "08:30"
		String endTime, // "17:30"
		boolean holidayCalendarEnabled,
		List<String> observedHolidays
) {}
