package com.crm.customer.health.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.customer.health.application.dto.CustomerHealthScoreDto;
import com.crm.customer.health.application.service.CustomerHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/health-score")
public class CustomerHealthController {

	private final CustomerHealthService customerHealthService;

	public CustomerHealthController(CustomerHealthService customerHealthService) {
		this.customerHealthService = customerHealthService;
	}

	@GetMapping("/{accountId}")
	public ResponseEntity<CustomerHealthScoreDto> getHealthScore(@PathVariable UUID accountId) {
		CustomerHealthScoreDto result = customerHealthService.calculateHealthScore(accountId);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/at-risk")
	public ResponseEntity<List<CustomerHealthScoreDto>> getAtRiskAccounts() {
		List<CustomerHealthScoreDto> list = customerHealthService.getAtRiskAccounts();
		return ResponseEntity.ok(list);
	}
}
