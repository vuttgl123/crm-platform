package com.crm.customer.contact.application.port;

import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.application.query.ContactSearchQuery;
import com.crm.customer.contact.domain.Contact;
import com.crm.customer.contact.domain.ContactId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface ContactRepository {

	Optional<Contact> findById(TenantId tenantId, ContactId contactId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<ContactSummary> search(TenantId tenantId, ActorId actorId,
			ContactSearchQuery query, AuthorizedDataAccess access);

	boolean existsByContactNumber(TenantId tenantId, String contactNumber,
			ContactId excludeId);

	boolean existsAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	void save(Contact contact);

	com.crm.customer.contact.application.dto.ContactStatsDto getStats(
			TenantId tenantId, ActorId actorId, AuthorizedDataAccess access);

	void setPrimary(TenantId tenantId, ContactId id, boolean isPrimary,
			long expectedVersion, ActorId actorId, java.time.Instant now);

	void transferAccount(TenantId tenantId, ContactId id, AccountId newAccountId,
			String jobTitle, long expectedVersion, ActorId actorId, java.time.Instant now);

	int bulkUpdateLifecycle(TenantId tenantId, java.util.List<ContactId> ids,
			String lifecycleStage, ActorId actorId, java.time.Instant now);

}
