package com.crm.customer.deduplication.presentation.web;

import java.util.List;

import com.crm.customer.deduplication.application.dto.DuplicateMatchGroup;
import com.crm.customer.deduplication.application.dto.MergeAccountRequest;
import com.crm.customer.deduplication.application.service.AccountDeduplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crm/deduplication")
public class AccountDeduplicationController {

	private final AccountDeduplicationService deduplicationService;

	public AccountDeduplicationController(AccountDeduplicationService deduplicationService) {
		this.deduplicationService = deduplicationService;
	}

	@GetMapping("/scan")
	public ResponseEntity<List<DuplicateMatchGroup>> scanDuplicates() {
		List<DuplicateMatchGroup> list = deduplicationService.scanDuplicates();
		return ResponseEntity.ok(list);
	}

	@PostMapping("/merge")
	public ResponseEntity<Boolean> mergeAccounts(@RequestBody MergeAccountRequest request) {
		boolean success = deduplicationService.mergeAccounts(request);
		return ResponseEntity.ok(success);
	}
}
