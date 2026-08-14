package com.crm.customer.opportunity.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.application.port.OpportunityRepository;
import com.crm.customer.opportunity.application.query.OpportunitySearchQuery;
import com.crm.customer.opportunity.domain.Opportunity;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOpportunityRepository implements OpportunityRepository {

	private static final String OPPORTUNITY_SELECT = """
			SELECT o.tenant_id, o.id, o.opportunity_number, o.name,
			       o.account_id, o.pipeline_id, o.current_stage_id,
			       o.owner_user_id, o.owner_team_id, o.source_id,
			       o.primary_contact_id, o.opportunity_type, o.status,
			       o.amount, o.currency_code, o.probability,
			       o.expected_close_date, o.actual_close_date,
			       o.next_step, o.description, o.lost_reason_id,
			       o.lost_reason_notes, o.campaign_id, o.created_at,
			       o.created_by, o.updated_at, o.updated_by,
			       o.deleted_at, o.deleted_by, o.version
			FROM crm_opportunities o
			""";

	private static final String SUMMARY_SELECT = """
			SELECT o.id, o.opportunity_number, o.name, o.account_id,
			       o.pipeline_id, o.current_stage_id, o.owner_user_id,
			       o.owner_team_id, o.opportunity_type, o.status,
			       o.amount, o.currency_code, o.probability,
			       o.expected_close_date, o.updated_at, o.version
			FROM crm_opportunities o
			""";

	private final JdbcClient jdbcClient;

	public JdbcOpportunityRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Opportunity> findById(TenantId tenantId, OpportunityId opportunityId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("opportunityId", opportunityId.toString());
		String sql = scope.cte() + OPPORTUNITY_SELECT + """
				WHERE o.tenant_id = :tenantId
				  AND o.id = :opportunityId
				  AND o.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("o"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(OpportunityJdbcMapper::mapOpportunity)
				.optional();
	}

	@Override
	public PageResult<OpportunitySummary> search(TenantId tenantId,
			ActorId actorId, OpportunitySearchQuery query,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE o.tenant_id = :tenantId
				  AND o.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("o")));
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_opportunities o
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<OpportunitySummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY o.updated_at DESC, o.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(OpportunityJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsByOpportunityNumber(TenantId tenantId, String opportunityNumber,
			OpportunityId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM crm_opportunities o
				WHERE o.tenant_id = :tenantId
				  AND o.opportunity_number = :opportunityNumber
				  AND o.deleted_at IS NULL
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());
		parameters.put("opportunityNumber", opportunityNumber);
		if (excludeId != null) {
			sql.append(" AND o.id <> :excludeId");
			parameters.put("excludeId", excludeId.toString());
		}
		Long count = jdbcClient.sql(sql.toString())
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a"));
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsPipeline(TenantId tenantId, UUID pipelineId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"pipelineId", pipelineId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM crm_pipelines p
				WHERE p.tenant_id = :tenantId
				  AND p.id = :pipelineId
				  AND p.is_active = true
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsStage(TenantId tenantId, UUID pipelineId, UUID stageId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"pipelineId", pipelineId.toString(),
				"stageId", stageId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM crm_pipeline_stages s
				WHERE s.tenant_id = :tenantId
				  AND s.pipeline_id = :pipelineId
				  AND s.id = :stageId
				  AND s.is_active = true
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("contactId", contactId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM crm_contacts c
				WHERE c.tenant_id = :tenantId
				  AND c.id = :contactId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("c"));
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public void save(Opportunity opportunity) {
		Objects.requireNonNull(opportunity, "opportunity must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", opportunity.tenantId().toString());
		parameters.put("id", opportunity.id().toString());
		parameters.put("opportunityNumber", opportunity.opportunityNumber());
		parameters.put("name", opportunity.name());
		parameters.put("accountId", opportunity.accountId().toString());
		parameters.put("pipelineId", opportunity.pipelineId().toString());
		parameters.put("currentStageId", opportunity.currentStageId().toString());
		parameters.put("ownerUserId", opportunity.owner() != null
				&& opportunity.owner().type() == AccountOwnerType.USER
				? opportunity.owner().id().toString() : null);
		parameters.put("ownerTeamId", opportunity.owner() != null
				&& opportunity.owner().type() == AccountOwnerType.TEAM
				? opportunity.owner().id().toString() : null);
		parameters.put("sourceId", opportunity.sourceId() == null ? null : opportunity.sourceId().toString());
		parameters.put("primaryContactId", opportunity.primaryContactId() == null ? null : opportunity.primaryContactId().toString());
		parameters.put("opportunityType", opportunity.opportunityType().name());
		parameters.put("status", opportunity.status().name());
		parameters.put("amount", opportunity.amount().amount());
		parameters.put("currencyCode", opportunity.amount().currencyCode());
		parameters.put("probability", opportunity.probability());
		parameters.put("expectedCloseDate", opportunity.expectedCloseDate());
		parameters.put("actualCloseDate", opportunity.actualCloseDate());
		parameters.put("nextStep", opportunity.nextStep());
		parameters.put("description", opportunity.description());
		parameters.put("lostReasonId", opportunity.lostReasonId() == null ? null : opportunity.lostReasonId().toString());
		parameters.put("lostReasonNotes", opportunity.lostReasonNotes());
		parameters.put("campaignId", opportunity.campaignId() == null ? null : opportunity.campaignId().toString());
		parameters.put("createdAt", Timestamp.from(opportunity.createdAt()));
		parameters.put("createdBy", opportunity.createdBy() == null ? null : opportunity.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(opportunity.updatedAt()));
		parameters.put("updatedBy", opportunity.updatedBy() == null ? null : opportunity.updatedBy().toString());
		parameters.put("deletedAt", opportunity.deletedAt() == null ? null : Timestamp.from(opportunity.deletedAt()));
		parameters.put("deletedBy", opportunity.deletedBy() == null ? null : opportunity.deletedBy().toString());
		parameters.put("version", opportunity.version());

		String sql = """
				INSERT INTO crm_opportunities (
				    tenant_id, id, opportunity_number, name, account_id,
				    pipeline_id, current_stage_id, owner_user_id, owner_team_id,
				    source_id, primary_contact_id, opportunity_type, status,
				    amount, currency_code, probability, expected_close_date,
				    actual_close_date, next_step, description, lost_reason_id,
				    lost_reason_notes, campaign_id, created_at, created_by,
				    updated_at, updated_by, deleted_at, deleted_by, version
				) VALUES (
				    :tenantId, :id, :opportunityNumber, :name, :accountId,
				    :pipelineId, :currentStageId, :ownerUserId, :ownerTeamId,
				    :sourceId, :primaryContactId, :opportunityType, :status,
				    :amount, :currencyCode, :probability, :expectedCloseDate,
				    :actualCloseDate, :nextStep, :description, :lostReasonId,
				    :lostReasonNotes, :campaignId, :createdAt, :createdBy,
				    :updatedAt, :updatedBy, :deletedAt, :deletedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    name = VALUES(name),
				    account_id = VALUES(account_id),
				    pipeline_id = VALUES(pipeline_id),
				    current_stage_id = VALUES(current_stage_id),
				    owner_user_id = VALUES(owner_user_id),
				    owner_team_id = VALUES(owner_team_id),
				    source_id = VALUES(source_id),
				    primary_contact_id = VALUES(primary_contact_id),
				    opportunity_type = VALUES(opportunity_type),
				    status = VALUES(status),
				    amount = VALUES(amount),
				    currency_code = VALUES(currency_code),
				    probability = VALUES(probability),
				    expected_close_date = VALUES(expected_close_date),
				    actual_close_date = VALUES(actual_close_date),
				    next_step = VALUES(next_step),
				    description = VALUES(description),
				    lost_reason_id = VALUES(lost_reason_id),
				    lost_reason_notes = VALUES(lost_reason_notes),
				    campaign_id = VALUES(campaign_id),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    deleted_at = VALUES(deleted_at),
				    deleted_by = VALUES(deleted_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, OpportunitySearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(o.name) LIKE :searchPattern
					      OR LOWER(o.opportunity_number) LIKE :searchPattern
					      OR LOWER(o.next_step) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.accountId() != null) {
			criteria.append(" AND o.account_id = :filterAccountId");
			parameters.put("filterAccountId", query.accountId().toString());
		}
		if (query.pipelineId() != null) {
			criteria.append(" AND o.pipeline_id = :filterPipelineId");
			parameters.put("filterPipelineId", query.pipelineId().toString());
		}
		if (query.stageId() != null) {
			criteria.append(" AND o.current_stage_id = :filterStageId");
			parameters.put("filterStageId", query.stageId().toString());
		}
		if (query.status() != null) {
			criteria.append(" AND o.status = :filterStatus");
			parameters.put("filterStatus", query.status().name());
		}
		if (query.opportunityType() != null) {
			criteria.append(" AND o.opportunity_type = :filterOppType");
			parameters.put("filterOppType", query.opportunityType().name());
		}
		if (query.owner() != null) {
			if (query.owner().type() == AccountOwnerType.USER) {
				criteria.append(" AND o.owner_user_id = :filterOwnerId");
			} else {
				criteria.append(" AND o.owner_team_id = :filterOwnerId");
			}
			parameters.put("filterOwnerId", query.owner().id().toString());
		}
	}

}
