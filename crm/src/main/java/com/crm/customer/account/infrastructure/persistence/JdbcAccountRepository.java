package com.crm.customer.account.infrastructure.persistence;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.application.port.AccountRepository;
import com.crm.customer.account.application.query.AccountSearchQuery;
import com.crm.customer.account.domain.Account;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AnnualRevenue;
import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.DataScopeType;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAccountRepository implements AccountRepository {

	private static final String ACCOUNT_SELECT = """
			SELECT a.tenant_id, a.id, a.account_number, a.account_type,
			       a.legal_name, a.display_name, a.parent_account_id,
			       a.owner_user_id, a.owner_team_id, a.lifecycle_stage,
			       a.industry_code, a.tax_identifier, a.registration_number,
			       a.website, a.annual_revenue, a.revenue_currency_code,
			       a.employee_count, a.description,
			       a.preferred_language_code, a.do_not_contact,
			       a.created_at, a.created_by, a.updated_at, a.updated_by,
			       a.deleted_at, a.deleted_by, a.version
			FROM crm_accounts a
			""";

	private static final String SUMMARY_SELECT = """
			SELECT a.id, a.account_number, a.display_name, a.legal_name,
			       a.parent_account_id, a.account_type, a.lifecycle_stage,
			       a.owner_user_id, a.owner_team_id, a.do_not_contact,
			       a.updated_at, a.version
			FROM crm_accounts a
			""";

	private final JdbcClient jdbcClient;

	public JdbcAccountRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Account> findById(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		String sql = scope.cte() + ACCOUNT_SELECT + """
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountJdbcMapper::mapAccount)
				.optional();
	}

	@Override
	public PageResult<AccountSummary> search(TenantId tenantId,
			ActorId actorId, AccountSearchQuery query,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE a.tenant_id = :tenantId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a")));
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_accounts a
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());
		List<AccountSummary> items = jdbcClient.sql(
				scope.cte() + SUMMARY_SELECT + criteria + """
				ORDER BY a.updated_at DESC, a.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(AccountJdbcMapper::mapSummary)
				.list();

		return PageResult.of(items, query.pageQuery(), totalElements);
	}

	@Override
	public boolean existsActiveNumber(TenantId tenantId,
			String accountNumber) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.account_number = :accountNumber
				  AND a.deleted_at IS NULL
				""")
				.param("tenantId", tenantId.toString())
				.param("accountNumber", accountNumber)
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public boolean ownerReferenceExists(TenantId tenantId,
			AccountOwner owner) {
		Objects.requireNonNull(owner, "owner must not be null");
		if (owner.type() == AccountOwnerType.USER) {
			return jdbcClient.sql("""
					SELECT COUNT(*)
					FROM platform_tenant_memberships m
					JOIN platform_users u ON u.id = m.user_id
					WHERE m.tenant_id = :tenantId
					  AND m.user_id = :ownerId
					  AND m.membership_status = 'ACTIVE'
					  AND m.removed_at IS NULL
					  AND u.status = 'ACTIVE'
					""")
					.param("tenantId", tenantId.toString())
					.param("ownerId", owner.id().toString())
					.query(Long.class)
					.single() > 0L;
		}
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_teams t
				WHERE t.tenant_id = :tenantId
				  AND t.id = :ownerId
				  AND t.status = 'ACTIVE'
				  AND t.deleted_at IS NULL
				""")
				.param("tenantId", tenantId.toString())
				.param("ownerId", owner.id().toString())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public boolean ownerAllowed(TenantId tenantId, ActorId actorId,
			AccountOwner owner, AuthorizedDataAccess access) {
		Objects.requireNonNull(owner, "owner must not be null");
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		if (scope.includes(DataScopeType.TENANT)) {
			return true;
		}
		if (owner.type() == AccountOwnerType.USER) {
			return owner.id().equals(actorId.value())
					&& scope.includes(DataScopeType.OWN);
		}
		if (scope.directlyIncludesTeam(owner.id())) {
			return true;
		}
		return scope.hasTeamTree()
				&& treeContainsTeam(tenantId, owner, scope);
	}

	@Override
	public boolean parentAllowed(TenantId tenantId, ActorId actorId,
			AccountId parentAccountId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("parentAccountId", parentAccountId.toString());
		return jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :parentAccountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void insert(Account account) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO crm_accounts (
				    tenant_id, id, account_number, account_type,
				    legal_name, display_name, parent_account_id,
				    owner_user_id, owner_team_id, lifecycle_stage,
				    industry_code, tax_identifier, registration_number,
				    website, annual_revenue, revenue_currency_code,
				    employee_count, description, preferred_language_code,
				    do_not_contact, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :accountNumber, :accountType,
				    :legalName, :displayName, :parentAccountId,
				    :ownerUserId, :ownerTeamId, :lifecycleStage,
				    :industryCode, :taxIdentifier, :registrationNumber,
				    :website, :annualRevenue, :revenueCurrencyCode,
				    :employeeCount, :description, :preferredLanguageCode,
				    :doNotContact, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""")
				.params(insertParameters(account))
				.update();
		if (affectedRows != 1) {
			throw new IllegalStateException(
					"Account insert must affect exactly one row");
		}
	}

	@Override
	public int update(Account account, long expectedVersion, ActorId actorId,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.putAll(mutationParameters(account));
		parameters.put("expectedVersion", expectedVersion);
		return jdbcClient.sql(scope.cte() + """
				UPDATE crm_accounts
				SET account_type = :accountType,
				    legal_name = :legalName,
				    display_name = :displayName,
				    parent_account_id = :parentAccountId,
				    owner_user_id = :ownerUserId,
				    owner_team_id = :ownerTeamId,
				    lifecycle_stage = :lifecycleStage,
				    industry_code = :industryCode,
				    tax_identifier = :taxIdentifier,
				    registration_number = :registrationNumber,
				    website = :website,
				    annual_revenue = :annualRevenue,
				    revenue_currency_code = :revenueCurrencyCode,
				    employee_count = :employeeCount,
				    description = :description,
				    preferred_language_code = :preferredLanguageCode,
				    do_not_contact = :doNotContact,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				  AND deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("")))
				.params(parameters)
				.update();
	}

	@Override
	public int softDelete(Account account, long expectedVersion,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", account.tenantId().toString());
		parameters.put("id", account.id().toString());
		parameters.put("expectedVersion", expectedVersion);
		parameters.put("deletedAt",
				AccountJdbcMapper.timestamp(account.deletedAt()));
		parameters.put("deletedBy", actorId(account.deletedBy()));
		parameters.put("updatedAt",
				AccountJdbcMapper.timestamp(account.updatedAt()));
		parameters.put("updatedBy", actorId(account.updatedBy()));
		parameters.put("newVersion", account.version());
		return jdbcClient.sql(scope.cte() + """
				UPDATE crm_accounts
				SET deleted_at = :deletedAt,
				    deleted_by = :deletedBy,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				  AND deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("")))
				.params(parameters)
				.update();
	}

	private boolean treeContainsTeam(TenantId tenantId, AccountOwner owner,
			OwnershipScopeSql scope) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("ownerTeamId", owner.id().toString());
		return jdbcClient.sql(scope.cte() + """
			SELECT COUNT(*)
			FROM authorized_account_team_tree
			WHERE id = :ownerTeamId
			""")
				.params(parameters)
				.query(Long.class)
				.single() > 0L;
	}

	private static void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, AccountSearchQuery query) {
		if (query.keyword() != null) {
			criteria.append("""
					  AND (
					      a.account_number LIKE :accountNumberPrefix ESCAPE '\\\\'
					      OR MATCH(
					          a.account_number,
					          a.display_name,
					          a.legal_name,
					          a.tax_identifier,
					          a.registration_number
					      ) AGAINST (:keyword IN NATURAL LANGUAGE MODE)
					  )
					""");
			parameters.put("accountNumberPrefix",
					escapeLikePrefix(query.keyword()) + "%");
			parameters.put("keyword", query.keyword());
		}
		if (query.accountType() != null) {
			criteria.append("  AND a.account_type = :accountType\n");
			parameters.put("accountType", query.accountType().name());
		}
		if (query.lifecycleStage() != null) {
			criteria.append("  AND a.lifecycle_stage = :lifecycleStage\n");
			parameters.put("lifecycleStage", query.lifecycleStage().name());
		}
		if (query.owner() != null) {
			String column = query.owner().type() == AccountOwnerType.USER
					? "owner_user_id" : "owner_team_id";
			criteria.append("  AND a.")
					.append(column)
					.append(" = :ownerId\n");
			parameters.put("ownerId", query.owner().id().toString());
		}
	}

	private static String escapeLikePrefix(String value) {
		return value
				.replace("\\", "\\\\")
				.replace("%", "\\%")
				.replace("_", "\\_");
	}

	private static Map<String, Object> insertParameters(Account account) {
		Map<String, Object> parameters = mutationParameters(account);
		parameters.put("accountNumber", account.accountNumber());
		parameters.put("createdAt",
				AccountJdbcMapper.timestamp(account.createdAt()));
		parameters.put("createdBy", actorId(account.createdBy()));
		return parameters;
	}

	private static Map<String, Object> mutationParameters(Account account) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", account.tenantId().toString());
		parameters.put("id", account.id().toString());
		parameters.put("accountType", account.accountType().name());
		parameters.put("legalName", account.legalName());
		parameters.put("displayName", account.displayName());
		parameters.put("parentAccountId", accountId(account.parentAccountId()));
		parameters.put("ownerUserId", ownerId(
				account.owner(), AccountOwnerType.USER));
		parameters.put("ownerTeamId", ownerId(
				account.owner(), AccountOwnerType.TEAM));
		parameters.put("lifecycleStage", account.lifecycleStage().name());
		parameters.put("industryCode", account.industryCode());
		parameters.put("taxIdentifier", account.taxIdentifier());
		parameters.put("registrationNumber", account.registrationNumber());
		parameters.put("website", account.website());
		parameters.put("annualRevenue", revenueAmount(account.annualRevenue()));
		parameters.put("revenueCurrencyCode",
				revenueCurrency(account.annualRevenue()));
		parameters.put("employeeCount", account.employeeCount());
		parameters.put("description", account.description());
		parameters.put("preferredLanguageCode",
				account.preferredLanguageCode());
		parameters.put("doNotContact", account.doNotContact());
		parameters.put("updatedAt",
				AccountJdbcMapper.timestamp(account.updatedAt()));
		parameters.put("updatedBy", actorId(account.updatedBy()));
		parameters.put("version", account.version());
		parameters.put("newVersion", account.version());
		return parameters;
	}

	private static String accountId(AccountId value) {
		return value == null ? null : value.toString();
	}

	private static String actorId(ActorId value) {
		return value == null ? null : value.toString();
	}

	private static String ownerId(AccountOwner owner, AccountOwnerType type) {
		return owner != null && owner.type() == type
				? owner.id().toString() : null;
	}

	private static BigDecimal revenueAmount(AnnualRevenue revenue) {
		return revenue == null ? null : revenue.amount();
	}

	private static String revenueCurrency(AnnualRevenue revenue) {
		return revenue == null ? null : revenue.currencyCode();
	}

}
