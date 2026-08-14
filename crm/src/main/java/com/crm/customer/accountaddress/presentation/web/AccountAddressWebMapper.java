package com.crm.customer.accountaddress.presentation.web;

import java.util.List;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.application.command.CreateAccountAddressCommand;
import com.crm.customer.accountaddress.application.command.UpdateAccountAddressCommand;
import com.crm.customer.accountaddress.application.dto.AccountAddressDetails;
import com.crm.customer.accountaddress.application.query.AccountAddressSearchQuery;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import org.springframework.stereotype.Component;

@Component
public final class AccountAddressWebMapper {

	public CreateAccountAddressCommand toCreateCommand(
			AccountId accountId, CreateAccountAddressRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new CreateAccountAddressCommand(accountId,
				request.addressType(), request.addressLine1(),
				request.addressLine2(), request.locality(),
				request.administrativeArea(), request.postalCode(),
				request.countryCode(), request.latitude(), request.longitude(),
				request.formattedAddress(), request.isPrimary(),
				request.validFrom());
	}

	public AccountAddressSearchQuery toSearchQuery(AccountId accountId,
			AccountAddressSearchRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new AccountAddressSearchQuery(accountId, request.addressType(),
				request.includeHistory());
	}

	public UpdateAccountAddressCommand toUpdateCommand(AccountId accountId,
			AccountAddressId addressId, long version,
			UpdateAccountAddressRequest request) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(addressId, "addressId must not be null");
		Objects.requireNonNull(request, "request must not be null");
		return new UpdateAccountAddressCommand(accountId, addressId, version,
				request.addressType(), request.addressLine1(),
				request.addressLine2(), request.locality(),
				request.administrativeArea(), request.postalCode(),
				request.countryCode(), request.latitude(), request.longitude(),
				request.formattedAddress(), request.isPrimary(),
				request.validFrom());
	}

	public AccountAddressResponse toResponse(AccountAddressDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new AccountAddressResponse(details.id(), details.accountId(),
				details.addressType(), details.addressLine1(),
				details.addressLine2(), details.locality(),
				details.administrativeArea(), details.postalCode(),
				details.countryCode(), details.latitude(), details.longitude(),
				details.formattedAddress(), details.validationStatus(),
				details.isPrimary(), details.validFrom(), details.validTo(),
				details.version(), details.createdAt(), details.updatedAt());
	}

	public List<AccountAddressResponse> toResponses(
			List<AccountAddressDetails> details) {
		Objects.requireNonNull(details, "details must not be null");
		return details.stream().map(this::toResponse).toList();
	}

}
