package com.crm.customer.accountcommunicationchannel.application.usecase;

import java.util.List;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.application.command.CreateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.command.DeleteAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.command.UpdateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.dto.AccountCommunicationChannelDetails;

public interface AccountCommunicationChannelFacade {

	AccountCommunicationChannelDetails create(
			CreateAccountCommunicationChannelCommand command);

	List<AccountCommunicationChannelDetails> list(AccountId accountId);

	AccountCommunicationChannelDetails update(
			UpdateAccountCommunicationChannelCommand command);

	void delete(DeleteAccountCommunicationChannelCommand command);

}
