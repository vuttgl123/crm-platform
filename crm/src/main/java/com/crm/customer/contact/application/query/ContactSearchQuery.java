package com.crm.customer.contact.application.query;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactLifecycleStage;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.sharedkernel.application.PageQuery;

public record ContactSearchQuery(
		String search,
		AccountId accountId,
		ContactLifecycleStage lifecycleStage,
		ContactOwner owner,
		PageQuery pageQuery) {
}
