package com.crm.platform.settings.application.command;

import java.util.List;

public record UpdateBusinessHoursCommand(
		String timezone,
		List<String> workDays,
		String startTime,
		String endTime,
		boolean holidayCalendarEnabled,
		List<String> observedHolidays
) {}
