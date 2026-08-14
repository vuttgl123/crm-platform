package com.crm.customer.accountaddress.application.usecase;

import java.util.List;

import com.crm.customer.accountaddress.application.command.CreateAccountAddressCommand;
import com.crm.customer.accountaddress.application.command.EndAccountAddressCommand;
import com.crm.customer.accountaddress.application.command.UpdateAccountAddressCommand;
import com.crm.customer.accountaddress.application.dto.AccountAddressDetails;
import com.crm.customer.accountaddress.application.query.AccountAddressSearchQuery;

public interface AccountAddressFacade {

	AccountAddressDetails create(CreateAccountAddressCommand command);

	List<AccountAddressDetails> list(AccountAddressSearchQuery query);

	AccountAddressDetails update(UpdateAccountAddressCommand command);

	AccountAddressDetails end(EndAccountAddressCommand command);

}
