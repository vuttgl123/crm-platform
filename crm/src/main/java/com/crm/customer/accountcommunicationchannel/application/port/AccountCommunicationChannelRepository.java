package com.crm.customer.accountcommunicationchannel.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannel;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface AccountCommunicationChannelRepository {

	boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean lockAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<AccountCommunicationChannel> findById(
			TenantId tenantId, AccountId accountId,
			AccountCommunicationChannelId channelId,
			ActorId actorId, AuthorizedDataAccess access);

	List<AccountCommunicationChannel> findAll(
			TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsActiveDuplicate(TenantId tenantId, AccountId accountId,
			ChannelType channelType, String canonicalValue,
			AccountCommunicationChannelId excludedChannelId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<AccountCommunicationChannel> findPrimary(
			TenantId tenantId, AccountId accountId, ChannelType channelType,
			AccountCommunicationChannelId excludedChannelId,
			ActorId actorId, AuthorizedDataAccess access);

	void insert(AccountCommunicationChannel channel);

	int update(AccountCommunicationChannel channel, long expectedVersion,
			ActorId actorId, AuthorizedDataAccess access);

	int softDelete(AccountCommunicationChannel channel, long expectedVersion,
			ActorId actorId, AuthorizedDataAccess access);

}
