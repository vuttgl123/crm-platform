package com.crm.customer.accountrelationship.application.usecase;

import com.crm.customer.accountrelationship.application.command.CreateAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.command.EndAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.query.AccountRelationshipSearchQuery;
import com.crm.sharedkernel.application.PageResult;

public interface AccountRelationshipFacade {

	AccountRelationshipDetails create(CreateAccountRelationshipCommand command);

	PageResult<AccountRelationshipDetails> search(
			AccountRelationshipSearchQuery query);

	AccountRelationshipDetails end(EndAccountRelationshipCommand command);

}
