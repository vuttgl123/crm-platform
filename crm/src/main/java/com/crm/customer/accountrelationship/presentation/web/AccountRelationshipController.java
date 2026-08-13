package com.crm.customer.accountrelationship.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.usecase.AccountRelationshipFacade;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts/{accountId}/relationships")
public final class AccountRelationshipController {

	private final AccountRelationshipFacade accountRelationships;
	private final AccountRelationshipWebMapper mapper;

	public AccountRelationshipController(
			AccountRelationshipFacade accountRelationships,
			AccountRelationshipWebMapper mapper) {
		this.accountRelationships = accountRelationships;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<AccountRelationshipResponse> create(
			@PathVariable UUID accountId,
			@Valid @RequestBody CreateAccountRelationshipRequest request) {
		AccountRelationshipDetails created = accountRelationships.create(
				mapper.toCreateCommand(new AccountId(accountId), request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping
	public PageResult<AccountRelationshipResponse> search(
			@PathVariable UUID accountId,
			@Valid @ModelAttribute AccountRelationshipSearchRequest request) {
		return mapper.toPage(accountRelationships.search(mapper.toSearchQuery(
				new AccountId(accountId), request)));
	}

	@PostMapping("/{relationshipId}/end")
	public AccountRelationshipResponse end(@PathVariable UUID accountId,
			@PathVariable UUID relationshipId,
			@Valid @RequestBody EndAccountRelationshipRequest request) {
		AccountRelationshipDetails ended = accountRelationships.end(
				mapper.toEndCommand(new AccountId(accountId),
						new AccountRelationshipId(relationshipId), request));
		return mapper.toResponse(ended);
	}

}
