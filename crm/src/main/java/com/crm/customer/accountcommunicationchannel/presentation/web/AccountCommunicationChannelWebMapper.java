package com.crm.customer.accountcommunicationchannel.presentation.web;

import java.util.List;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.application.command.CreateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.command.UpdateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.dto.AccountCommunicationChannelDetails;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import org.springframework.stereotype.Component;

@Component
public final class AccountCommunicationChannelWebMapper {

	public CreateAccountCommunicationChannelCommand toCreateCommand(
			AccountId accountId,
			CreateAccountCommunicationChannelRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new CreateAccountCommunicationChannelCommand(accountId,
				request.channelType(), request.rawValue(), request.label(),
				request.isPrimary(), request.doNotUse());
	}

	public UpdateAccountCommunicationChannelCommand toUpdateCommand(
			AccountId accountId, AccountCommunicationChannelId channelId,
			long version, UpdateAccountCommunicationChannelRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(channelId, "channelId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new UpdateAccountCommunicationChannelCommand(accountId, channelId,
				version, request.channelType(), request.rawValue(), request.label(),
				request.isPrimary(), request.doNotUse());
	}

	public AccountCommunicationChannelResponse toResponse(
			AccountCommunicationChannelDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new AccountCommunicationChannelResponse(details.id(),
				details.accountId(), details.channelType(), details.rawValue(),
				details.normalizedValue(), details.label(), details.isPrimary(),
				details.isVerified(), details.verifiedAt(), details.doNotUse(),
				details.version(), details.createdAt(), details.updatedAt());
	}

	public List<AccountCommunicationChannelResponse> toResponses(
			List<AccountCommunicationChannelDetails> details) {
		Objects.requireNonNull(details, "details must not be null");
		return details.stream().map(this::toResponse).toList();
	}

}
