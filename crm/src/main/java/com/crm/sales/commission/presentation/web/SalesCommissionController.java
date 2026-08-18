package com.crm.sales.commission.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.sales.commission.application.dto.ApproveCommissionRequest;
import com.crm.sales.commission.application.dto.CalculateCommissionRequest;
import com.crm.sales.commission.application.dto.SalesCommissionItemDto;
import com.crm.sales.commission.application.service.SalesCommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/commissions")
public class SalesCommissionController {

	private final SalesCommissionService salesCommissionService;

	public SalesCommissionController(SalesCommissionService salesCommissionService) {
		this.salesCommissionService = salesCommissionService;
	}

	@GetMapping
	public ResponseEntity<List<SalesCommissionItemDto>> listCommissions(
			@RequestParam(required = false) String period
	) {
		List<SalesCommissionItemDto> list = salesCommissionService.listCommissions(period);
		return ResponseEntity.ok(list);
	}

	@PostMapping("/calculate")
	public ResponseEntity<SalesCommissionItemDto> calculateCommission(
			@RequestBody CalculateCommissionRequest request
	) {
		SalesCommissionItemDto dto = salesCommissionService.calculateCommission(request);
		return ResponseEntity.ok(dto);
	}

	@PutMapping("/{id}/approve")
	public ResponseEntity<Boolean> approveCommission(
			@PathVariable UUID id,
			@RequestBody(required = false) ApproveCommissionRequest request
	) {
		boolean success = salesCommissionService.approveCommission(id, request);
		return ResponseEntity.ok(success);
	}
}
