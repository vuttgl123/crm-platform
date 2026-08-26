package com.crm.overview.application.dto;

public record LifecycleCount(
		String lifecycleStage,
		long accountCount
) {
}
