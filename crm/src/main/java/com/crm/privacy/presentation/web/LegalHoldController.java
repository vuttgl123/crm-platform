package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.privacy.application.command.ReleaseLegalHoldCommand;
import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.application.usecase.LegalHoldFacade;
import com.crm.privacy.domain.LegalHoldId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/privacy/legal-holds")
public final class LegalHoldController {

	private final LegalHoldFacade legalHolds;
	private final LegalHoldWebMapper mapper;

	public LegalHoldController(LegalHoldFacade legalHolds, LegalHoldWebMapper mapper) {
		this.legalHolds = legalHolds;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<LegalHoldResponse> create(@Valid @RequestBody CreateLegalHoldRequest request) {
		LegalHoldDetails created = legalHolds.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public LegalHoldResponse get(@PathVariable UUID id) {
		return mapper.toResponse(legalHolds.get(new LegalHoldId(id)));
	}

	@GetMapping
	public List<LegalHoldResponse> list() {
		return mapper.toResponseList(legalHolds.list());
	}

	@PostMapping("/{id}/release")
	public LegalHoldResponse release(@PathVariable UUID id) {
		LegalHoldDetails released = legalHolds.release(new ReleaseLegalHoldCommand(new LegalHoldId(id)));
		return mapper.toResponse(released);
	}

}
