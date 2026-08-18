package com.crm.marketing.drip.application.dto;

public record DripStepDto(
		int stepOrder,
		String stepType,
		String name,
		int delayDays,
		String templateSubject,
		String templateBody,
		String actionTarget
) {}
