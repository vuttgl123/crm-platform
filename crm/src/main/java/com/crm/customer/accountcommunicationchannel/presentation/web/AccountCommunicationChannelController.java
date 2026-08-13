package com.crm.customer.accountcommunicationchannel.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.application.command.DeleteAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.dto.AccountCommunicationChannelDetails;
import com.crm.customer.accountcommunicationchannel.application.usecase.AccountCommunicationChannelFacade;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts/{accountId}/communication-channels")
public final class AccountCommunicationChannelController {

	private final AccountCommunicationChannelFacade communicationChannels;
	private final AccountCommunicationChannelWebMapper mapper;

	public AccountCommunicationChannelController(
			AccountCommunicationChannelFacade communicationChannels,
			AccountCommunicationChannelWebMapper mapper) {
		this.communicationChannels = communicationChannels;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<AccountCommunicationChannelResponse> create(
			@PathVariable UUID accountId,
			@Valid @RequestBody CreateAccountCommunicationChannelRequest request) {
		AccountCommunicationChannelDetails created = communicationChannels.create(
				mapper.toCreateCommand(new AccountId(accountId), request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping
	public List<AccountCommunicationChannelResponse> list(
			@PathVariable UUID accountId) {
		return mapper.toResponses(communicationChannels.list(
				new AccountId(accountId)));
	}

	@PutMapping("/{channelId}")
	public AccountCommunicationChannelResponse update(
			@PathVariable UUID accountId,
			@PathVariable UUID channelId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody UpdateAccountCommunicationChannelRequest request) {
		AccountCommunicationChannelDetails updated = communicationChannels.update(
				mapper.toUpdateCommand(new AccountId(accountId),
						new AccountCommunicationChannelId(channelId),
						IfMatchVersion.parse(ifMatch), request));
		return mapper.toResponse(updated);
	}

	@DeleteMapping("/{channelId}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID accountId,
			@PathVariable UUID channelId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		communicationChannels.delete(new DeleteAccountCommunicationChannelCommand(
				new AccountId(accountId), new AccountCommunicationChannelId(channelId),
				IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

}
