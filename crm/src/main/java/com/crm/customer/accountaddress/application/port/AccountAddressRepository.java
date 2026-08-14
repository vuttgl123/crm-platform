package com.crm.customer.accountaddress.application.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.application.query.AccountAddressSearchQuery;
import com.crm.customer.accountaddress.domain.AccountAddress;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface AccountAddressRepository {

	boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean lockAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<AccountAddress> findById(
			TenantId tenantId, AccountId accountId,
			AccountAddressId addressId, ActorId actorId,
			AuthorizedDataAccess access);

	List<AccountAddress> findAll(
			TenantId tenantId, ActorId actorId,
			AccountAddressSearchQuery query, LocalDate currentDate,
			AuthorizedDataAccess access);

	Optional<AccountAddress> findCurrentPrimary(
			TenantId tenantId, AccountId accountId,
			AccountAddressType addressType,
			AccountAddressId excludedAddressId, LocalDate currentDate,
			ActorId actorId, AuthorizedDataAccess access);

	void insert(AccountAddress address);

	int update(AccountAddress address,
			AccountAddressType persistedAddressType,
			long expectedVersion, ActorId actorId,
			AuthorizedDataAccess access);

}
