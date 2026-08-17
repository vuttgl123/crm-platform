package com.crm.customer.pipeline.presentation.web;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.customer.pipeline.domain.ForecastCategory;
import com.crm.customer.pipeline.domain.StageCategory;

public record CreatePipelineStageRequest(
		@NotBlank(message = "Stage code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Stage code must be 2-50 characters alphanumeric or underscore")
		String stageCode,

		@NotBlank(message = "Stage name must not be blank")
		@Size(max = 100, message = "Stage name must not exceed 100 characters")
		String name,

		@Min(value = 0, message = "Display order must be non-negative")
		int displayOrder,

		@DecimalMin(value = "0.00", message = "Probability must be >= 0%")
		@DecimalMax(value = "100.00", message = "Probability must be <= 100%")
		BigDecimal defaultProbability,

		StageCategory stageCategory,
		ForecastCategory forecastCategory
) {
}
