package com.crm.customer.contact.application.usecase;

import com.crm.customer.contact.application.command.CreateContactCommand;
import com.crm.customer.contact.application.command.DeleteContactCommand;
import com.crm.customer.contact.application.command.UpdateContactCommand;
import com.crm.customer.contact.application.dto.ContactDetails;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.application.query.ContactSearchQuery;
import com.crm.customer.contact.domain.ContactId;
import com.crm.sharedkernel.application.PageResult;

public interface ContactFacade {

	ContactDetails create(CreateContactCommand command);

	ContactDetails get(ContactId contactId);

	PageResult<ContactSummary> search(ContactSearchQuery query);

	ContactDetails update(UpdateContactCommand command);

	void delete(DeleteContactCommand command);

	com.crm.customer.contact.application.dto.ContactStatsDto getStats();

	ContactDetails setPrimary(com.crm.customer.contact.application.command.SetPrimaryContactCommand command);

	ContactDetails transferAccount(com.crm.customer.contact.application.command.TransferContactAccountCommand command);

	int bulkUpdateLifecycle(com.crm.customer.contact.application.command.BulkUpdateContactLifecycleCommand command);

}
