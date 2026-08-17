package com.crm.sales.forecast.presentation.web;

import com.crm.sales.forecast.application.dto.SalesForecastSummary;
import com.crm.sales.forecast.application.service.SalesForecastService;
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
	public ResponseEntity<SalesForecastSummary> getForecastSummary(
			@RequestParam(defaultValue = "THIS_MONTH") String period
	) {
		SalesForecastSummary summary = salesForecastService.getForecastSummary(period);
		return ResponseEntity.ok(summary);
	}
}
