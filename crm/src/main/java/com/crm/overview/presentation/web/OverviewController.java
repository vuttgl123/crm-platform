package com.crm.overview.presentation.web;

import com.crm.overview.application.dto.OverviewResponse;
import com.crm.overview.application.service.OverviewService;
import com.crm.sales.forecast.domain.ForecastPeriodPreset;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * The single call behind the overview screen.
 *
 * <p>Six blocks arrive in one response rather than six requests, so the actor's
 * data scope is resolved once per block instead of once per round trip. The
 * response is always {@code 200} for an authenticated caller: blocks the actor
 * cannot see come back {@code null} rather than failing the request.
 */
@RestController
@RequestMapping("/api/overview")
public class OverviewController {

	private final OverviewService overviewService;

	public OverviewController(OverviewService overviewService) {
		this.overviewService = overviewService;
	}

	@GetMapping
	public ResponseEntity<OverviewResponse> getOverview(
			@RequestParam(required = false, defaultValue = "THIS_QUARTER")
			ForecastPeriodPreset period
	) {
		return ResponseEntity.ok(overviewService.getOverview(period));
	}

}
