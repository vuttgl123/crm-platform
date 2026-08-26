package com.crm.customer.accountcommunicationchannel.infrastructure.persistence;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.application.port.AccountCommunicationChannelRepository;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannel;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
import com.crm.customer.accountcommunicationchannel.domain.ChannelType;
import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAccountCommunicationChannelRepository
		implements AccountCommunicationChannelRepository {

	private static final String CHANNEL_PROJECTION = """
			SELECT c.tenant_id, c.id, c.account_id, c.channel_type,
			       c.raw_value, c.normalized_value, c.label,
			       c.is_primary, c.is_verified, c.verified_at, c.do_not_use,
			       c.created_at, c.created_by, c.updated_at, c.updated_by,
			       c.deleted_at, c.deleted_by, c.version
			""";

	private static final String SCOPED_CHANNEL_FROM = """
			FROM crm_communication_channels c
			JOIN crm_accounts a
			  ON a.tenant_id = c.tenant_id
			 AND a.id = c.account_id
			 AND a.deleted_at IS NULL
			""";

	private final JdbcClient jdbcClient;

	public JdbcAccountCommunicationChannelRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		return jdbcClient.sql(scope.cte() + """
				SELECT a.id
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(accountParameters(scope, tenantId, accountId))
				.query(String.class)
				.optional()
				.isPresent();
	}

	@Override
	public boolean lockAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		String sql = scope.cte() + """
				SELECT a.id
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				FOR UPDATE
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(accountParameters(scope, tenantId, accountId))
				.query(String.class)
				.optional()
				.isPresent();
	}

	@Override
	public Optional<AccountCommunicationChannel> findById(TenantId tenantId,
			AccountId accountId, AccountCommunicationChannelId channelId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = channelParameters(scope, tenantId,
				accountId);
		parameters.put("channelId", channelId.toString());
		String sql = scope.cte() + CHANNEL_PROJECTION + SCOPED_CHANNEL_FROM + """
				WHERE c.tenant_id = :tenantId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.id = :channelId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountCommunicationChannelJdbcMapper::mapChannel)
				.optional();
	}

	@Override
	public List<AccountCommunicationChannel> findAll(TenantId tenantId,
			AccountId accountId, ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		String sql = scope.cte() + CHANNEL_PROJECTION + SCOPED_CHANNEL_FROM + """
				WHERE c.tenant_id = :tenantId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.deleted_at IS NULL
				  AND (%s)
				ORDER BY c.channel_type ASC,
				         c.is_primary DESC,
				         c.created_at ASC,
				         c.id ASC
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(channelParameters(scope, tenantId, accountId))
				.query(AccountCommunicationChannelJdbcMapper::mapChannel)
				.list();
	}

	@Override
	public boolean existsActiveDuplicate(TenantId tenantId, AccountId accountId,
			ChannelType channelType, String canonicalValue,
			AccountCommunicationChannelId excludedChannelId, ActorId actorId,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = channelParameters(scope, tenantId,
				accountId);
		parameters.put("channelType", channelType.name());
		parameters.put("canonicalValue", canonicalValue);
		String excludedChannelIdSql = "";
		if (excludedChannelId != null) {
			excludedChannelIdSql = "  AND c.id <> :excludedChannelId\n";
			parameters.put("excludedChannelId", excludedChannelId.toString());
		}
		String sql = scope.cte() + """
				SELECT COUNT(*)
				""" + SCOPED_CHANNEL_FROM + """
				WHERE c.tenant_id = :tenantId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.deleted_at IS NULL
				  AND c.channel_type = :channelType
				""" + excludedChannelIdSql + """
				  AND (
				      (:channelType = 'OTHER'
				        AND BINARY c.raw_value = BINARY :canonicalValue)
				      OR
				      (:channelType <> 'OTHER'
				        AND BINARY c.normalized_value = BINARY :canonicalValue)
				  )
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public Optional<AccountCommunicationChannel> findPrimary(TenantId tenantId,
			AccountId accountId, ChannelType channelType,
			AccountCommunicationChannelId excludedChannelId, ActorId actorId,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = channelParameters(scope, tenantId,
				accountId);
		parameters.put("channelType", channelType.name());
		String excludedChannelIdSql = "";
		if (excludedChannelId != null) {
			excludedChannelIdSql = "  AND c.id <> :excludedChannelId\n";
			parameters.put("excludedChannelId", excludedChannelId.toString());
		}
		String sql = scope.cte() + CHANNEL_PROJECTION + SCOPED_CHANNEL_FROM + """
				WHERE c.tenant_id = :tenantId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.deleted_at IS NULL
				  AND c.channel_type = :channelType
				  AND c.is_primary = true
				""" + excludedChannelIdSql + """
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountCommunicationChannelJdbcMapper::mapChannel)
				.optional();
	}

	@Override
	public void insert(AccountCommunicationChannel channel) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO crm_communication_channels (
				    tenant_id, id, account_id, contact_id, channel_type,
				    raw_value, normalized_value, label,
				    is_primary, is_verified, verified_at, do_not_use,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :accountId, NULL, :channelType,
				    :rawValue, :normalizedValue, :label,
				    :isPrimary, :isVerified, :verifiedAt, :doNotUse,
				    :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""")
				.params(insertParameters(channel))
				.update();
		if (affectedRows != 1) {
			throw new IllegalStateException(
					"Account communication channel insert must affect exactly one row");
		}
	}

	@Override
	public int update(AccountCommunicationChannel channel, long expectedVersion,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = mutationParameters(scope, channel);
		parameters.put("expectedVersion", expectedVersion);
		return jdbcClient.sql(scope.cte() + """
				UPDATE crm_communication_channels c
				JOIN crm_accounts a
				  ON a.tenant_id = c.tenant_id
				 AND a.id = c.account_id
				 AND a.deleted_at IS NULL
				SET c.channel_type = :channelType,
				    c.raw_value = :rawValue,
				    c.normalized_value = :normalizedValue,
				    c.label = :label,
				    c.is_primary = :isPrimary,
				    c.do_not_use = :doNotUse,
				    c.updated_at = :updatedAt,
				    c.updated_by = :updatedBy,
				    c.version = :newVersion
				WHERE c.tenant_id = :tenantId
				  AND c.id = :channelId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.deleted_at IS NULL
				  AND c.version = :expectedVersion
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.update();
	}

	@Override
	public int softDelete(AccountCommunicationChannel channel,
			long expectedVersion, ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = deletionParameters(scope, channel);
		parameters.put("expectedVersion", expectedVersion);
		return jdbcClient.sql(scope.cte() + """
				UPDATE crm_communication_channels c
				JOIN crm_accounts a
				  ON a.tenant_id = c.tenant_id
				 AND a.id = c.account_id
				 AND a.deleted_at IS NULL
				SET c.deleted_at = :deletedAt,
				    c.deleted_by = :deletedBy,
				    c.updated_at = :updatedAt,
				    c.updated_by = :updatedBy,
				    c.version = :newVersion
				WHERE c.tenant_id = :tenantId
				  AND c.id = :channelId
				  AND c.account_id = :accountId
				  AND c.contact_id IS NULL
				  AND c.deleted_at IS NULL
				  AND c.version = :expectedVersion
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.update();
	}

	private static Map<String, Object> accountParameters(OwnershipScopeSql scope,
			TenantId tenantId, AccountId accountId) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		return parameters;
	}

	private static Map<String, Object> channelParameters(OwnershipScopeSql scope,
			TenantId tenantId, AccountId accountId) {
		return accountParameters(scope, tenantId, accountId);
	}

	private static Map<String, Object> insertParameters(
			AccountCommunicationChannel channel) {
		Map<String, Object> parameters = editableParameters(channel);
		parameters.put("id", channel.id().toString());
		parameters.put("isVerified", channel.isVerified());
		parameters.put("verifiedAt", AccountCommunicationChannelJdbcMapper
				.timestamp(channel.verifiedAt()));
		parameters.put("createdAt", AccountCommunicationChannelJdbcMapper
				.timestamp(channel.createdAt()));
		parameters.put("createdBy", actorId(channel.createdBy()));
		parameters.put("version", channel.version());
		return parameters;
	}

	private static Map<String, Object> mutationParameters(OwnershipScopeSql scope,
			AccountCommunicationChannel channel) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.putAll(editableParameters(channel));
		parameters.put("channelId", channel.id().toString());
		parameters.put("newVersion", channel.version());
		return parameters;
	}

	private static Map<String, Object> deletionParameters(OwnershipScopeSql scope,
			AccountCommunicationChannel channel) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", channel.tenantId().toString());
		parameters.put("channelId", channel.id().toString());
		parameters.put("accountId", channel.accountId().toString());
		parameters.put("deletedAt", AccountCommunicationChannelJdbcMapper
				.timestamp(channel.deletedAt()));
		parameters.put("deletedBy", actorId(channel.deletedBy()));
		parameters.put("updatedAt", AccountCommunicationChannelJdbcMapper
				.timestamp(channel.updatedAt()));
		parameters.put("updatedBy", actorId(channel.updatedBy()));
		parameters.put("newVersion", channel.version());
		return parameters;
	}

	private static Map<String, Object> editableParameters(
			AccountCommunicationChannel channel) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", channel.tenantId().toString());
		parameters.put("accountId", channel.accountId().toString());
		parameters.put("channelType", channel.channelType().name());
		parameters.put("rawValue", channel.rawValue());
		parameters.put("normalizedValue", channel.normalizedValue());
		parameters.put("label", channel.label());
		parameters.put("isPrimary", channel.isPrimary());
		parameters.put("doNotUse", channel.doNotUse());
		parameters.put("updatedAt", AccountCommunicationChannelJdbcMapper
				.timestamp(channel.updatedAt()));
		parameters.put("updatedBy", actorId(channel.updatedBy()));
		return parameters;
	}

	private static String actorId(ActorId value) {
		return value == null ? null : value.toString();
	}

}
