package com.crm.marketing.analytics.presentation.web;

import java.util.List;

import com.crm.marketing.analytics.application.dto.ChannelPerformance;
import com.crm.marketing.analytics.application.dto.MarketingAnalyticsResponse;
import com.crm.marketing.analytics.application.dto.MarketingFunnelStage;
import com.crm.marketing.analytics.application.dto.MarketingRoiSummary;
import com.crm.marketing.analytics.application.service.MarketingAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing/analytics")
public class MarketingAnalyticsController {

	private final MarketingAnalyticsService analyticsService;

	public MarketingAnalyticsController(MarketingAnalyticsService analyticsService) {
		this.analyticsService = analyticsService;
	}

	@GetMapping
	public ResponseEntity<MarketingAnalyticsResponse> getFullAnalytics() {
		MarketingAnalyticsResponse response = analyticsService.getFullAnalytics();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/roi-summary")
	public ResponseEntity<MarketingRoiSummary> getRoiSummary() {
		MarketingRoiSummary summary = analyticsService.getRoiSummary();
		return ResponseEntity.ok(summary);
	}

	@GetMapping("/channels")
	public ResponseEntity<List<ChannelPerformance>> getChannelPerformance() {
		List<ChannelPerformance> list = analyticsService.getChannelPerformance();
		return ResponseEntity.ok(list);
	}

	@GetMapping("/funnel")
	public ResponseEntity<List<MarketingFunnelStage>> getFunnelStages() {
		List<MarketingFunnelStage> list = analyticsService.getFunnelStages();
		return ResponseEntity.ok(list);
	}
}
