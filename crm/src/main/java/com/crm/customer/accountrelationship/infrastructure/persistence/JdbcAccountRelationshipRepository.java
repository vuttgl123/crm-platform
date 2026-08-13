package com.crm.customer.accountrelationship.infrastructure.persistence;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.port.AccountRelationshipRepository;
import com.crm.customer.accountrelationship.application.query.AccountRelationshipSearchQuery;
import com.crm.customer.accountrelationship.domain.AccountRelationship;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAccountRelationshipRepository
		implements AccountRelationshipRepository {

	private static final String DOMAIN_PROJECTION = """
			SELECT r.tenant_id, r.id, r.account_id, r.related_account_id,
			       r.relationship_type, r.valid_from, r.valid_to,
			       r.description, r.created_at, r.created_by
			""";

	private static final String DETAILS_PROJECTION = """
			SELECT r.id,
			       source.id AS source_id,
			       source.account_number AS source_number,
			       source.display_name AS source_name,
			       target.id AS target_id,
			       target.account_number AS target_number,
			       target.display_name AS target_name,
			       CASE
			         WHEN r.account_id = :pathAccountId THEN 'OUTBOUND'
			         ELSE 'INBOUND'
			       END AS direction,
			       r.relationship_type, r.valid_from, r.valid_to,
			       r.description, r.created_at, r.created_by
			""";

	private static final String RELATIONSHIP_FROM = """
			FROM crm_account_relationships r
			JOIN crm_accounts source
			  ON source.tenant_id = r.tenant_id
			 AND source.id = r.account_id
			 AND source.deleted_at IS NULL
			JOIN crm_accounts target
			  ON target.tenant_id = r.tenant_id
			 AND target.id = r.related_account_id
			 AND target.deleted_at IS NULL
			""";

	private final JdbcClient jdbcClient;

	public JdbcAccountRelationshipRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		return jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void insert(AccountRelationship relationship) {
		int affectedRows = jdbcClient.sql("""
				INSERT INTO crm_account_relationships (
				    tenant_id, id, account_id, related_account_id,
				    relationship_type, valid_from, valid_to,
				    description, created_at, created_by
				) VALUES (
				    :tenantId, :id, :accountId, :relatedAccountId,
				    :relationshipType, :validFrom, :validTo,
				    :description, :createdAt, :createdBy
				)
				""")
				.params(relationshipParameters(relationship))
				.update();
		if (affectedRows != 1) {
			throw new IllegalStateException(
					"Account relationship insert must affect exactly one row");
		}
	}

	@Override
	public Optional<AccountRelationship> findForEnd(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = relationshipLookupParameters(scope,
				tenantId, pathAccountId, relationshipId);
		String sql = scope.cte() + DOMAIN_PROJECTION + RELATIONSHIP_FROM + """
				WHERE r.tenant_id = :tenantId
				  AND r.id = :relationshipId
				  AND (r.account_id = :pathAccountId
				       OR r.related_account_id = :pathAccountId)
				  AND (%s)
				  AND (%s)
				FOR UPDATE
				""".formatted(scope.predicate("source"),
					scope.predicate("target"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountRelationshipJdbcMapper::mapRelationship)
				.optional();
	}

	@Override
	public int end(AccountRelationship relationship, AccountId pathAccountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", relationship.tenantId().toString());
		parameters.put("relationshipId", relationship.id().toString());
		parameters.put("pathAccountId", pathAccountId.toString());
		parameters.put("validTo", relationship.validTo());
		return jdbcClient.sql(scope.cte() + """
				UPDATE crm_account_relationships r
				JOIN crm_accounts source
				  ON source.tenant_id = r.tenant_id
				 AND source.id = r.account_id
				 AND source.deleted_at IS NULL
				JOIN crm_accounts target
				  ON target.tenant_id = r.tenant_id
				 AND target.id = r.related_account_id
				 AND target.deleted_at IS NULL
				SET r.valid_to = :validTo
				WHERE r.tenant_id = :tenantId
				  AND r.id = :relationshipId
				  AND (r.account_id = :pathAccountId
				       OR r.related_account_id = :pathAccountId)
				  AND (%s)
				  AND (%s)
				  AND r.valid_to IS NULL
				""".formatted(scope.predicate("source"),
					scope.predicate("target")))
				.params(parameters)
				.update();
	}

	@Override
	public Optional<AccountRelationshipDetails> findDetails(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = relationshipLookupParameters(scope,
				tenantId, pathAccountId, relationshipId);
		String sql = scope.cte() + DETAILS_PROJECTION + RELATIONSHIP_FROM + """
				WHERE r.tenant_id = :tenantId
				  AND r.id = :relationshipId
				  AND (r.account_id = :pathAccountId
				       OR r.related_account_id = :pathAccountId)
				  AND (%s)
				  AND (%s)
				""".formatted(scope.predicate("source"),
					scope.predicate("target"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountRelationshipJdbcMapper::mapDetails)
				.optional();
	}

	@Override
	public PageResult<AccountRelationshipDetails> search(TenantId tenantId,
			ActorId actorId, AccountRelationshipSearchQuery query,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("pathAccountId", query.accountId().toString());

		String scopedRelationshipFrom = RELATIONSHIP_FROM + """
				WHERE r.tenant_id = :tenantId
				  AND (r.account_id = :pathAccountId
				       OR r.related_account_id = :pathAccountId)
				  AND (%s)
				  AND (%s)
				""".formatted(scope.predicate("source"),
					scope.predicate("target"));

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				""" + scopedRelationshipFrom)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());
		List<AccountRelationshipDetails> items = jdbcClient.sql(
				scope.cte() + DETAILS_PROJECTION + scopedRelationshipFrom + """
				ORDER BY r.created_at DESC, r.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(AccountRelationshipJdbcMapper::mapDetails)
				.list();

		return PageResult.of(items, query.pageQuery(), totalElements);
	}

	private static Map<String, Object> relationshipLookupParameters(
			AccountScopeSql scope, TenantId tenantId, AccountId pathAccountId,
			AccountRelationshipId relationshipId) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("pathAccountId", pathAccountId.toString());
		parameters.put("relationshipId", relationshipId.toString());
		return parameters;
	}

	private static Map<String, Object> relationshipParameters(
			AccountRelationship relationship) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", relationship.tenantId().toString());
		parameters.put("id", relationship.id().toString());
		parameters.put("accountId", relationship.accountId().toString());
		parameters.put("relatedAccountId",
				relationship.relatedAccountId().toString());
		parameters.put("relationshipType",
				relationship.relationshipType().name());
		parameters.put("validFrom", relationship.validFrom());
		parameters.put("validTo", relationship.validTo());
		parameters.put("description", relationship.description());
		parameters.put("createdAt",
				AccountRelationshipJdbcMapper.timestamp(
						relationship.createdAt()));
		parameters.put("createdBy", relationship.createdBy() == null
				? null : relationship.createdBy().toString());
		return parameters;
	}

}
