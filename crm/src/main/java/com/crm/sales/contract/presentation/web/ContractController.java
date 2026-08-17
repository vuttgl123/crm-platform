package com.crm.sales.contract.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sales.contract.application.dto.ContractDetails;
import com.crm.sales.contract.application.usecase.ContractFacade;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contracts")
public final class ContractController {

	private final ContractFacade contracts;
	private final ContractWebMapper mapper;

	public ContractController(ContractFacade contracts, ContractWebMapper mapper) {
		this.contracts = contracts;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ContractResponse> create(@Valid @RequestBody CreateContractRequest request) {
		ContractDetails created = contracts.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public ContractResponse get(@PathVariable UUID id) {
		return mapper.toResponse(contracts.get(new ContractId(id)));
	}

	@GetMapping
	public PageResult<ContractSummaryResponse> search(@Valid @ModelAttribute ContractSearchRequest request) {
		return mapper.toSummaryPage(contracts.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public ContractResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateContractRequest request) {
		return mapper.toResponse(contracts.update(mapper.toUpdateCommand(new ContractId(id), request)));
	}

	@PostMapping("/{id}/submit-review")
	public ContractResponse submitForReview(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(contracts.submitForReview(new ContractId(id), IfMatchVersion.parse(ifMatch)));
	}

	@PostMapping("/{id}/approve")
	public ContractResponse approve(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(contracts.approve(new ContractId(id), IfMatchVersion.parse(ifMatch)));
	}

	@PostMapping("/{id}/send-signature")
	public ContractResponse sendForSignature(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		return mapper.toResponse(contracts.sendForSignature(new ContractId(id), IfMatchVersion.parse(ifMatch)));
	}

	@PostMapping("/{id}/sign")
	public ContractResponse sign(
			@PathVariable UUID id,
			@Valid @RequestBody SignContractRequest request) {
		return mapper.toResponse(contracts.sign(mapper.toSignCommand(new ContractId(id), request)));
	}

	@PostMapping("/{id}/terminate")
	public ContractResponse terminate(
			@PathVariable UUID id,
			@Valid @RequestBody TerminateContractRequest request) {
		return mapper.toResponse(contracts.terminate(mapper.toTerminateCommand(new ContractId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		contracts.delete(new ContractId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

}
