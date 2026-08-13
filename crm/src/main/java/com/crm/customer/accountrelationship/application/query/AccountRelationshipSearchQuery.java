package com.crm.customer.accountrelationship.application.query;

import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.application.PageQuery;

public record AccountRelationshipSearchQuery(
		AccountId accountId,
		PageQuery pageQuery) {

	public AccountRelationshipSearchQuery {
		Objects.requireNonNull(accountId, "accountId must not be null");
		Objects.requireNonNull(pageQuery, "pageQuery must not be null");
	}

}
