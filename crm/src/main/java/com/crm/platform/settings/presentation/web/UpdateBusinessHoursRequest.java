package com.crm.platform.settings.presentation.web;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBusinessHoursRequest(
		@NotBlank @Size(max = 100) String timezone,
		List<String> workDays,
		@NotBlank @Size(max = 10) String startTime,
		@NotBlank @Size(max = 10) String endTime,
		boolean holidayCalendarEnabled,
		List<String> observedHolidays
) {}
