package com.crm.customer.account.application.port;

import java.util.Optional;

import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.application.query.AccountSearchQuery;
import com.crm.customer.account.domain.Account;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface AccountRepository {

	Optional<Account> findById(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<AccountSummary> search(TenantId tenantId, ActorId actorId,
			AccountSearchQuery query, AuthorizedDataAccess access);

	boolean existsActiveNumber(TenantId tenantId, String accountNumber);

	boolean ownerReferenceExists(TenantId tenantId, AccountOwner owner);

	boolean ownerAllowed(TenantId tenantId, ActorId actorId,
			AccountOwner owner, AuthorizedDataAccess access);

	boolean parentAllowed(TenantId tenantId, ActorId actorId,
			AccountId parentAccountId, AuthorizedDataAccess access);

	void insert(Account account);

	int update(Account account, long expectedVersion, ActorId actorId,
			AuthorizedDataAccess access);

	int softDelete(Account account, long expectedVersion, ActorId actorId,
			AuthorizedDataAccess access);

}
