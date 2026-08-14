package com.crm.customer.accountaddress.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.application.command.EndAccountAddressCommand;
import com.crm.customer.accountaddress.application.dto.AccountAddressDetails;
import com.crm.customer.accountaddress.application.usecase.AccountAddressFacade;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/accounts/{accountId}/addresses")
public final class AccountAddressController {

	private final AccountAddressFacade accountAddresses;
	private final AccountAddressWebMapper mapper;

	public AccountAddressController(AccountAddressFacade accountAddresses,
			AccountAddressWebMapper mapper) {
		this.accountAddresses = accountAddresses;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<AccountAddressResponse> create(
			@PathVariable UUID accountId,
			@Valid @RequestBody CreateAccountAddressRequest request) {
		AccountAddressDetails created = accountAddresses.create(
				mapper.toCreateCommand(new AccountId(accountId), request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping
	public List<AccountAddressResponse> list(
			@PathVariable UUID accountId,
			@Valid @ModelAttribute AccountAddressSearchRequest request) {
		return mapper.toResponses(accountAddresses.list(mapper.toSearchQuery(
				new AccountId(accountId), request)));
	}

	@PutMapping("/{addressId}")
	public AccountAddressResponse update(
			@PathVariable UUID accountId,
			@PathVariable UUID addressId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody UpdateAccountAddressRequest request) {
		AccountAddressDetails updated = accountAddresses.update(
				mapper.toUpdateCommand(new AccountId(accountId),
						new AccountAddressId(addressId),
						IfMatchVersion.parse(ifMatch), request));
		return mapper.toResponse(updated);
	}

	@PostMapping("/{addressId}/end")
	public AccountAddressResponse end(
			@PathVariable UUID accountId,
			@PathVariable UUID addressId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		AccountAddressDetails ended = accountAddresses.end(
				new EndAccountAddressCommand(new AccountId(accountId),
						new AccountAddressId(addressId),
						IfMatchVersion.parse(ifMatch)));
		return mapper.toResponse(ended);
	}

}
