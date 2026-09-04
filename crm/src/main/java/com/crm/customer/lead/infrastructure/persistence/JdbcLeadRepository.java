package com.crm.customer.lead.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.application.port.LeadRepository;
import com.crm.customer.lead.application.query.LeadSearchQuery;
import com.crm.customer.lead.domain.Lead;
import com.crm.customer.lead.domain.LeadId;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcLeadRepository implements LeadRepository {

	private static final String LEAD_SELECT = """
			SELECT l.tenant_id, l.id, l.lead_number, l.status_id, l.source_id,
			       l.owner_user_id, l.owner_team_id, l.rating, l.account_name,
			       l.company_name, l.honorific, l.given_name, l.family_name,
			       l.display_name, l.email, l.phone_e164, l.job_title,
			       l.website, l.country_code, l.preferred_language_code,
			       l.estimated_value, l.currency_code, l.qualification_notes,
			       l.disqualification_reason, l.converted_at, l.converted_by,
			       l.converted_account_id, l.converted_contact_id,
			       l.converted_opportunity_id, l.created_at, l.created_by,
			       l.updated_at, l.updated_by, l.deleted_at, l.deleted_by,
			       l.version
			FROM crm_leads l
			""";

	private static final String SUMMARY_SELECT = """
			SELECT l.id, l.lead_number, l.status_id, l.source_id,
			       l.owner_user_id, l.owner_team_id, l.rating,
			       l.company_name, l.display_name, l.email, l.phone_e164,
			       l.job_title, l.estimated_value, l.currency_code,
			       l.converted_at, l.updated_at, l.version
			FROM crm_leads l
			""";

	private final JdbcClient jdbcClient;

	public JdbcLeadRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Lead> findById(TenantId tenantId, LeadId leadId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("leadId", leadId.toString());
		String sql = scope.cte() + LEAD_SELECT + """
				WHERE l.tenant_id = :tenantId
				  AND l.id = :leadId
				  AND l.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("l"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(LeadJdbcMapper::mapLead)
				.optional();
	}

	@Override
	public PageResult<LeadSummary> search(TenantId tenantId,
			ActorId actorId, LeadSearchQuery query,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE l.tenant_id = :tenantId
				  AND l.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("l")));
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_leads l
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<LeadSummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY l.updated_at DESC, l.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(LeadJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsByLeadNumber(TenantId tenantId, String leadNumber,
			LeadId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM crm_leads l
				WHERE l.tenant_id = :tenantId
				  AND l.lead_number = :leadNumber
				  AND l.deleted_at IS NULL
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());
		parameters.put("leadNumber", leadNumber);
		if (excludeId != null) {
			sql.append(" AND l.id <> :excludeId");
			parameters.put("excludeId", excludeId.toString());
		}
		Long count = jdbcClient.sql(sql.toString())
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsStatus(TenantId tenantId, UUID statusId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"statusId", statusId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM crm_lead_statuses s
				WHERE s.tenant_id = :tenantId
				  AND s.id = :statusId
				  AND s.is_active = true
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsSource(TenantId tenantId, UUID sourceId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"sourceId", sourceId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM crm_lead_sources s
				WHERE s.tenant_id = :tenantId
				  AND s.id = :sourceId
				  AND s.is_active = true
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
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
	public boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
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
	public void save(Lead lead) {
		Objects.requireNonNull(lead, "lead must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", lead.tenantId().toString());
		parameters.put("id", lead.id().toString());
		parameters.put("leadNumber", lead.leadNumber());
		parameters.put("statusId", lead.statusId().toString());
		parameters.put("sourceId", lead.sourceId() == null ? null : lead.sourceId().toString());
		parameters.put("ownerUserId", lead.owner() != null
				&& lead.owner().type() == AccountOwnerType.USER
				? lead.owner().id().toString() : null);
		parameters.put("ownerTeamId", lead.owner() != null
				&& lead.owner().type() == AccountOwnerType.TEAM
				? lead.owner().id().toString() : null);
		parameters.put("rating", lead.rating() == null ? null : lead.rating().name());
		parameters.put("accountName", lead.accountName());
		parameters.put("companyName", lead.companyName());
		parameters.put("honorific", lead.honorific());
		parameters.put("givenName", lead.givenName());
		parameters.put("familyName", lead.familyName());
		parameters.put("displayName", lead.displayName());
		parameters.put("email", lead.email());
		parameters.put("phoneE164", lead.phoneE164());
		parameters.put("jobTitle", lead.jobTitle());
		parameters.put("website", lead.website());
		parameters.put("countryCode", lead.countryCode());
		parameters.put("preferredLanguageCode", lead.preferredLanguageCode());
		parameters.put("estimatedValue", lead.estimatedValue() == null ? null : lead.estimatedValue().amount());
		parameters.put("currencyCode", lead.estimatedValue() == null ? null : lead.estimatedValue().currencyCode());
		parameters.put("qualificationNotes", lead.qualificationNotes());
		parameters.put("disqualificationReason", lead.disqualificationReason());
		parameters.put("convertedAt", lead.convertedAt() == null ? null : Timestamp.from(lead.convertedAt()));
		parameters.put("convertedBy", lead.convertedBy() == null ? null : lead.convertedBy().toString());
		parameters.put("convertedAccountId", lead.convertedAccountId() == null ? null : lead.convertedAccountId().toString());
		parameters.put("convertedContactId", lead.convertedContactId() == null ? null : lead.convertedContactId().toString());
		parameters.put("convertedOpportunityId", lead.convertedOpportunityId() == null ? null : lead.convertedOpportunityId().toString());
		parameters.put("createdAt", Timestamp.from(lead.createdAt()));
		parameters.put("createdBy", lead.createdBy() == null ? null : lead.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(lead.updatedAt()));
		parameters.put("updatedBy", lead.updatedBy() == null ? null : lead.updatedBy().toString());
		parameters.put("deletedAt", lead.deletedAt() == null ? null : Timestamp.from(lead.deletedAt()));
		parameters.put("deletedBy", lead.deletedBy() == null ? null : lead.deletedBy().toString());
		parameters.put("version", lead.version());

		String sql = """
				INSERT INTO crm_leads (
				    tenant_id, id, lead_number, status_id, source_id,
				    owner_user_id, owner_team_id, rating, account_name,
				    company_name, honorific, given_name, family_name,
				    display_name, email, phone_e164, job_title,
				    website, country_code, preferred_language_code,
				    estimated_value, currency_code, qualification_notes,
				    disqualification_reason, converted_at, converted_by,
				    converted_account_id, converted_contact_id,
				    converted_opportunity_id, created_at, created_by,
				    updated_at, updated_by, deleted_at, deleted_by,
				    version
				) VALUES (
				    :tenantId, :id, :leadNumber, :statusId, :sourceId,
				    :ownerUserId, :ownerTeamId, :rating, :accountName,
				    :companyName, :honorific, :givenName, :familyName,
				    :displayName, :email, :phoneE164, :jobTitle,
				    :website, :countryCode, :preferredLanguageCode,
				    :estimatedValue, :currencyCode, :qualificationNotes,
				    :disqualificationReason, :convertedAt, :convertedBy,
				    :convertedAccountId, :convertedContactId,
				    :convertedOpportunityId, :createdAt, :createdBy,
				    :updatedAt, :updatedBy, :deletedAt, :deletedBy,
				    :version
				)
				ON DUPLICATE KEY UPDATE
				    status_id = VALUES(status_id),
				    source_id = VALUES(source_id),
				    owner_user_id = VALUES(owner_user_id),
				    owner_team_id = VALUES(owner_team_id),
				    rating = VALUES(rating),
				    account_name = VALUES(account_name),
				    company_name = VALUES(company_name),
				    honorific = VALUES(honorific),
				    given_name = VALUES(given_name),
				    family_name = VALUES(family_name),
				    display_name = VALUES(display_name),
				    email = VALUES(email),
				    phone_e164 = VALUES(phone_e164),
				    job_title = VALUES(job_title),
				    website = VALUES(website),
				    country_code = VALUES(country_code),
				    preferred_language_code = VALUES(preferred_language_code),
				    estimated_value = VALUES(estimated_value),
				    currency_code = VALUES(currency_code),
				    qualification_notes = VALUES(qualification_notes),
				    disqualification_reason = VALUES(disqualification_reason),
				    converted_at = VALUES(converted_at),
				    converted_by = VALUES(converted_by),
				    converted_account_id = VALUES(converted_account_id),
				    converted_contact_id = VALUES(converted_contact_id),
				    converted_opportunity_id = VALUES(converted_opportunity_id),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    deleted_at = VALUES(deleted_at),
				    deleted_by = VALUES(deleted_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, LeadSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(l.display_name) LIKE :searchPattern
					      OR LOWER(l.lead_number) LIKE :searchPattern
					      OR LOWER(l.company_name) LIKE :searchPattern
					      OR LOWER(l.email) LIKE :searchPattern
					      OR LOWER(l.phone_e164) LIKE :searchPattern
					      OR LOWER(l.job_title) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.statusId() != null) {
			criteria.append(" AND l.status_id = :filterStatusId");
			parameters.put("filterStatusId", query.statusId().toString());
		}
		if (query.sourceId() != null) {
			criteria.append(" AND l.source_id = :filterSourceId");
			parameters.put("filterSourceId", query.sourceId().toString());
		}
		if (query.rating() != null) {
			criteria.append(" AND l.rating = :filterRating");
			parameters.put("filterRating", query.rating().name());
		}
		if (query.owner() != null) {
			if (query.owner().type() == AccountOwnerType.USER) {
				criteria.append(" AND l.owner_user_id = :filterOwnerId");
			} else {
				criteria.append(" AND l.owner_team_id = :filterOwnerId");
			}
			parameters.put("filterOwnerId", query.owner().id().toString());
		}
		if (query.converted() != null) {
			if (query.converted()) {
				criteria.append(" AND l.converted_at IS NOT NULL");
			} else {
				criteria.append(" AND l.converted_at IS NULL");
			}
		}
	}

	@Override
	public com.crm.customer.lead.application.dto.LeadStatsDto getStats(TenantId tenantId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		String baseSql = scope.cte() + """
				SELECT
				    COUNT(*) AS total,
				    COUNT(CASE WHEN l.converted_at IS NOT NULL THEN 1 END) AS converted,
				    COUNT(CASE WHEN l.converted_at IS NULL AND (s.code = 'NEW' OR s.code IS NULL) THEN 1 END) AS uncontacted,
				    COUNT(CASE WHEN l.converted_at IS NULL AND s.code = 'CONTACTED' THEN 1 END) AS working,
				    COUNT(CASE WHEN l.converted_at IS NULL AND s.code = 'QUALIFIED' THEN 1 END) AS qualified
				FROM crm_leads l
				LEFT JOIN crm_lead_statuses s ON s.id = l.status_id
				WHERE l.tenant_id = :tenantId
				  AND l.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("l"));

		return jdbcClient.sql(baseSql)
				.params(parameters)
				.query((rs, rowNum) -> {
					long total = rs.getLong("total");
					long converted = rs.getLong("converted");
					long uncontacted = rs.getLong("uncontacted");
					long working = rs.getLong("working");
					long qualified = rs.getLong("qualified");
					double rate = total > 0 ? (converted * 100.0) / total : 0.0;
					return new com.crm.customer.lead.application.dto.LeadStatsDto(
							total, uncontacted, working, qualified, converted, Math.round(rate * 10.0) / 10.0
					);
				}).single();
	}

	@Override
	public int bulkUpdateStatus(TenantId tenantId, List<LeadId> leadIds, UUID statusId,
			ActorId actorId, java.time.Instant now) {
		if (leadIds == null || leadIds.isEmpty()) return 0;
		List<String> idStrings = leadIds.stream().map(LeadId::toString).toList();
		return jdbcClient.sql("""
				UPDATE crm_leads
				SET status_id = :statusId,
				    updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id IN (:ids)
				  AND deleted_at IS NULL
				""")
				.param("statusId", statusId.toString())
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.toString())
				.param("tenantId", tenantId.toString())
				.param("ids", idStrings)
				.update();
	}

	@Override
	public int bulkAssign(TenantId tenantId, List<LeadId> leadIds, String ownerType, UUID ownerId,
			ActorId actorId, java.time.Instant now) {
		if (leadIds == null || leadIds.isEmpty()) return 0;
		List<String> idStrings = leadIds.stream().map(LeadId::toString).toList();
		boolean isUser = "USER".equalsIgnoreCase(ownerType);

		return jdbcClient.sql("""
				UPDATE crm_leads
				SET owner_user_id = :userId,
				    owner_team_id = :teamId,
				    updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id IN (:ids)
				  AND deleted_at IS NULL
				""")
				.param("userId", isUser ? ownerId.toString() : null)
				.param("teamId", !isUser ? ownerId.toString() : null)
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.toString())
				.param("tenantId", tenantId.toString())
				.param("ids", idStrings)
				.update();
	}

	@Override
	public List<com.crm.customer.lead.application.dto.LeadDuplicateMatchDto> findPotentialDuplicates(
			TenantId tenantId, String email, String phone, String companyName) {
		StringBuilder sql = new StringBuilder("""
				SELECT id, lead_number, display_name, email, phone_e164, company_name, job_title
				FROM crm_leads
				WHERE tenant_id = :tenantId
				  AND deleted_at IS NULL
				  AND (1=0
				""");
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.toString());

		if (email != null && !email.trim().isEmpty()) {
			sql.append(" OR LOWER(email) = :email");
			params.put("email", email.trim().toLowerCase());
		}
		if (phone != null && !phone.trim().isEmpty()) {
			sql.append(" OR phone_e164 = :phone");
			params.put("phone", phone.trim());
		}
		if (companyName != null && !companyName.trim().isEmpty()) {
			sql.append(" OR LOWER(company_name) = :companyName");
			params.put("companyName", companyName.trim().toLowerCase());
		}
		sql.append(") LIMIT 10");

		return jdbcClient.sql(sql.toString())
				.params(params)
				.query((rs, rowNum) -> {
					String matchReason = "Exact match";
					if (email != null && email.equalsIgnoreCase(rs.getString("email"))) {
						matchReason = "Matched by Email (" + email + ")";
					} else if (phone != null && phone.equals(rs.getString("phone_e164"))) {
						matchReason = "Matched by Phone (" + phone + ")";
					} else if (companyName != null && companyName.equalsIgnoreCase(rs.getString("company_name"))) {
						matchReason = "Matched by Company Name";
					}
					return new com.crm.customer.lead.application.dto.LeadDuplicateMatchDto(
							UUID.fromString(rs.getString("id")),
							rs.getString("lead_number"),
							rs.getString("job_title"),
							rs.getString("display_name"),
							rs.getString("email"),
							rs.getString("phone_e164"),
							rs.getString("company_name"),
							matchReason
					);
				}).list();
	}

}
