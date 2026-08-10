package com.crm.customer.account.application.usecase;

import com.crm.customer.account.application.command.CreateAccountCommand;
import com.crm.customer.account.application.command.DeleteAccountCommand;
import com.crm.customer.account.application.command.UpdateAccountCommand;
import com.crm.customer.account.application.dto.AccountDetails;
import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.application.query.AccountSearchQuery;
import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.application.PageResult;

public interface AccountFacade {

	AccountDetails create(CreateAccountCommand command);

	AccountDetails get(AccountId accountId);

	PageResult<AccountSummary> search(AccountSearchQuery query);

	AccountDetails update(UpdateAccountCommand command);

	void delete(DeleteAccountCommand command);

}
