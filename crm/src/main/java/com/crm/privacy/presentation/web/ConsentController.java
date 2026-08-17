package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.privacy.application.command.WithdrawConsentCommand;
import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.application.usecase.ConsentFacade;
import com.crm.privacy.domain.ConsentId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/privacy/consents")
public final class ConsentController {

	private final ConsentFacade consents;
	private final ConsentWebMapper mapper;

	public ConsentController(ConsentFacade consents, ConsentWebMapper mapper) {
		this.consents = consents;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ConsentResponse> capture(@Valid @RequestBody CaptureConsentRequest request) {
		ConsentDetails created = consents.capture(mapper.toCaptureCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public ConsentResponse get(@PathVariable UUID id) {
		return mapper.toResponse(consents.get(new ConsentId(id)));
	}

	@GetMapping
	public List<ConsentResponse> findByTarget(
			@RequestParam(required = false) UUID accountId,
			@RequestParam(required = false) UUID contactId,
			@RequestParam(required = false) UUID leadId) {
		return mapper.toResponseList(consents.findByTarget(accountId, contactId, leadId));
	}

	@PostMapping("/{id}/withdraw")
	public ConsentResponse withdraw(@PathVariable UUID id) {
		ConsentDetails withdrawn = consents.withdraw(new WithdrawConsentCommand(new ConsentId(id)));
		return mapper.toResponse(withdrawn);
	}

}
