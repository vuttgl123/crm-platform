package com.crm.customer.accountrelationship.application.port;

import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.query.AccountRelationshipSearchQuery;
import com.crm.customer.accountrelationship.domain.AccountRelationship;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface AccountRelationshipRepository {

	boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	void insert(AccountRelationship relationship);

	Optional<AccountRelationship> findForEnd(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access);

	int end(AccountRelationship relationship, AccountId pathAccountId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<AccountRelationshipDetails> findDetails(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<AccountRelationshipDetails> search(TenantId tenantId,
			ActorId actorId, AccountRelationshipSearchQuery query,
			AuthorizedDataAccess access);

}
