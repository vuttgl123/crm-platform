package com.crm.sales.forecast.presentation.web;

import java.util.UUID;

import com.crm.sales.forecast.application.dto.ForecastBreakdownResponse;
import com.crm.sales.forecast.application.dto.SalesForecastSummaryResponse;
import com.crm.sales.forecast.application.service.SalesForecastService;
import com.crm.sales.forecast.domain.ForecastBreakdownDimension;
import com.crm.sales.forecast.domain.ForecastPeriodPreset;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/forecast")
public class SalesForecastController {

	private final SalesForecastService salesForecastService;

	public SalesForecastController(SalesForecastService salesForecastService) {
		this.salesForecastService = salesForecastService;
	}

	@GetMapping
	public ResponseEntity<SalesForecastSummaryResponse> getForecastSummary(
			@RequestParam(required = false, defaultValue = "THIS_MONTH") ForecastPeriodPreset period,
			@RequestParam(required = false) UUID pipelineId,
			@RequestParam(required = false) String ownerType,
			@RequestParam(required = false) UUID ownerId,
			@RequestParam(required = false) String currencyCode
	) {
		SalesForecastSummaryResponse summary = salesForecastService.getSummary(
				period,
				pipelineId,
				ownerType,
				ownerId,
				currencyCode
		);
		return ResponseEntity.ok(summary);
	}

	@GetMapping("/breakdown")
	public ResponseEntity<ForecastBreakdownResponse> getForecastBreakdown(
			@RequestParam(required = false, defaultValue = "THIS_MONTH") ForecastPeriodPreset period,
			@RequestParam(required = false, defaultValue = "OWNER") ForecastBreakdownDimension dimension,
			@RequestParam(required = false, defaultValue = "USD") String currencyCode,
			@RequestParam(required = false) UUID pipelineId,
			@RequestParam(required = false) String ownerType,
			@RequestParam(required = false) UUID ownerId,
			@RequestParam(required = false, defaultValue = "0") int page,
			@RequestParam(required = false, defaultValue = "20") int size
	) {
		ForecastBreakdownResponse breakdown = salesForecastService.getBreakdown(
				period,
				dimension,
				currencyCode,
				pipelineId,
				ownerType,
				ownerId,
				page,
				size
		);
		return ResponseEntity.ok(breakdown);
	}
}
