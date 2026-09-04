package com.crm.customer.contact.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.application.port.ContactRepository;
import com.crm.customer.contact.application.query.ContactSearchQuery;
import com.crm.customer.contact.domain.Contact;
import com.crm.customer.contact.domain.ContactId;
import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcContactRepository implements ContactRepository {

	private static final String CONTACT_SELECT = """
			SELECT c.tenant_id, c.id, c.contact_number, c.account_id,
			       c.owner_user_id, c.owner_team_id, c.honorific,
			       c.given_name, c.middle_name, c.family_name,
			       c.display_name, c.job_title, c.department,
			       c.preferred_language_code, c.preferred_contact_channel,
			       c.lifecycle_stage, c.date_of_birth, c.do_not_contact,
			       c.description, c.created_at, c.created_by,
			       c.updated_at, c.updated_by, c.deleted_at, c.deleted_by,
			       c.version
			FROM crm_contacts c
			""";

	private static final String SUMMARY_SELECT = """
			SELECT c.id, c.contact_number, c.account_id, c.display_name,
			       c.job_title, c.department, c.preferred_contact_channel,
			       c.lifecycle_stage, c.owner_user_id, c.owner_team_id,
			       c.do_not_contact, c.updated_at, c.version
			FROM crm_contacts c
			""";

	private final JdbcClient jdbcClient;

	public JdbcContactRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Contact> findById(TenantId tenantId, ContactId contactId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("contactId", contactId.toString());
		String sql = scope.cte() + CONTACT_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.id = :contactId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("c"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(ContactJdbcMapper::mapContact)
				.optional();
	}

	@Override
	public PageResult<ContactSummary> search(TenantId tenantId,
			ActorId actorId, ContactSearchQuery query,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE c.tenant_id = :tenantId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("c")));
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM crm_contacts c
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<ContactSummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY c.updated_at DESC, c.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(ContactJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsByContactNumber(TenantId tenantId, String contactNumber,
			ContactId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM crm_contacts c
				WHERE c.tenant_id = :tenantId
				  AND c.contact_number = :contactNumber
				  AND c.deleted_at IS NULL
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());
		parameters.put("contactNumber", contactNumber);
		if (excludeId != null) {
			sql.append(" AND c.id <> :excludeId");
			parameters.put("excludeId", excludeId.toString());
		}
		Long count = jdbcClient.sql(sql.toString())
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsAccount(TenantId tenantId, AccountId accountId,
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
		Long count = jdbcClient.sql(sql)
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public void save(Contact contact) {
		Objects.requireNonNull(contact, "contact must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", contact.tenantId().toString());
		parameters.put("id", contact.id().toString());
		parameters.put("contactNumber", contact.contactNumber());
		parameters.put("accountId", contact.accountId() == null
				? null : contact.accountId().toString());
		parameters.put("ownerUserId", contact.owner() != null
				&& contact.owner().type() == AccountOwnerType.USER
				? contact.owner().id().toString() : null);
		parameters.put("ownerTeamId", contact.owner() != null
				&& contact.owner().type() == AccountOwnerType.TEAM
				? contact.owner().id().toString() : null);
		parameters.put("honorific", contact.honorific());
		parameters.put("givenName", contact.givenName());
		parameters.put("middleName", contact.middleName());
		parameters.put("familyName", contact.familyName());
		parameters.put("displayName", contact.displayName());
		parameters.put("jobTitle", contact.jobTitle());
		parameters.put("department", contact.department());
		parameters.put("preferredLanguageCode", contact.preferredLanguageCode());
		parameters.put("preferredContactChannel", contact.preferredContactChannel() == null
				? null : contact.preferredContactChannel().name());
		parameters.put("lifecycleStage", contact.lifecycleStage().name());
		parameters.put("dateOfBirth", contact.dateOfBirth());
		parameters.put("doNotContact", contact.isDoNotContact());
		parameters.put("description", contact.description());
		parameters.put("createdAt", Timestamp.from(contact.createdAt()));
		parameters.put("createdBy", contact.createdBy() == null
				? null : contact.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(contact.updatedAt()));
		parameters.put("updatedBy", contact.updatedBy() == null
				? null : contact.updatedBy().toString());
		parameters.put("deletedAt", contact.deletedAt() == null
				? null : Timestamp.from(contact.deletedAt()));
		parameters.put("deletedBy", contact.deletedBy() == null
				? null : contact.deletedBy().toString());
		parameters.put("version", contact.version());

		String sql = """
				INSERT INTO crm_contacts (
				    tenant_id, id, contact_number, account_id,
				    owner_user_id, owner_team_id, honorific,
				    given_name, middle_name, family_name,
				    display_name, job_title, department,
				    preferred_language_code, preferred_contact_channel,
				    lifecycle_stage, date_of_birth, do_not_contact,
				    description, created_at, created_by,
				    updated_at, updated_by, deleted_at, deleted_by,
				    version
				) VALUES (
				    :tenantId, :id, :contactNumber, :accountId,
				    :ownerUserId, :ownerTeamId, :honorific,
				    :givenName, :middleName, :familyName,
				    :displayName, :jobTitle, :department,
				    :preferredLanguageCode, :preferredContactChannel,
				    :lifecycleStage, :dateOfBirth, :doNotContact,
				    :description, :createdAt, :createdBy,
				    :updatedAt, :updatedBy, :deletedAt, :deletedBy,
				    :version
				)
				ON DUPLICATE KEY UPDATE
				    account_id = VALUES(account_id),
				    owner_user_id = VALUES(owner_user_id),
				    owner_team_id = VALUES(owner_team_id),
				    honorific = VALUES(honorific),
				    given_name = VALUES(given_name),
				    middle_name = VALUES(middle_name),
				    family_name = VALUES(family_name),
				    display_name = VALUES(display_name),
				    job_title = VALUES(job_title),
				    department = VALUES(department),
				    preferred_language_code = VALUES(preferred_language_code),
				    preferred_contact_channel = VALUES(preferred_contact_channel),
				    lifecycle_stage = VALUES(lifecycle_stage),
				    date_of_birth = VALUES(date_of_birth),
				    do_not_contact = VALUES(do_not_contact),
				    description = VALUES(description),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    deleted_at = VALUES(deleted_at),
				    deleted_by = VALUES(deleted_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, ContactSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(c.display_name) LIKE :searchPattern
					      OR LOWER(c.contact_number) LIKE :searchPattern
					      OR LOWER(c.job_title) LIKE :searchPattern
					      OR LOWER(c.department) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.accountId() != null) {
			criteria.append(" AND c.account_id = :filterAccountId");
			parameters.put("filterAccountId", query.accountId().toString());
		}
		if (query.lifecycleStage() != null) {
			criteria.append(" AND c.lifecycle_stage = :filterLifecycleStage");
			parameters.put("filterLifecycleStage", query.lifecycleStage().name());
		}
		if (query.owner() != null) {
			if (query.owner().type() == AccountOwnerType.USER) {
				criteria.append(" AND c.owner_user_id = :filterOwnerId");
			} else {
				criteria.append(" AND c.owner_team_id = :filterOwnerId");
			}
			parameters.put("filterOwnerId", query.owner().id().toString());
		}
	}

	@Override
	public com.crm.customer.contact.application.dto.ContactStatsDto getStats(
			TenantId tenantId, ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		String baseSql = scope.cte() + """
				SELECT
				    COUNT(*) AS total,
				    COUNT(CASE WHEN c.lifecycle_stage = 'PROSPECT' THEN 1 END) AS prospect_count,
				    COUNT(CASE WHEN c.lifecycle_stage = 'QUALIFIED' THEN 1 END) AS qualified_count,
				    COUNT(CASE WHEN c.lifecycle_stage = 'CUSTOMER' THEN 1 END) AS customer_count,
				    COUNT(CASE WHEN c.lifecycle_stage = 'INACTIVE' THEN 1 END) AS inactive_count,
				    COUNT(CASE WHEN c.lifecycle_stage = 'CHURNED' THEN 1 END) AS churned_count
				FROM crm_contacts c
				WHERE c.tenant_id = :tenantId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("c"));

		return jdbcClient.sql(baseSql)
				.params(parameters)
				.query((rs, rowNum) -> {
					long total = rs.getLong("total");
					long prospect = rs.getLong("prospect_count");
					long qualified = rs.getLong("qualified_count");
					long customer = rs.getLong("customer_count");
					long inactive = rs.getLong("inactive_count");
					long churned = rs.getLong("churned_count");
					long primary = Math.max(1, customer);

					return new com.crm.customer.contact.application.dto.ContactStatsDto(
							total,
							primary,
							prospect,
							qualified,
							customer,
							inactive,
							churned
					);
				}).single();
	}

	@Override
	public void setPrimary(TenantId tenantId, ContactId id, boolean isPrimary,
			long expectedVersion, ActorId actorId, java.time.Instant now) {
		String sql = """
				UPDATE crm_contacts
				SET updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				  AND deleted_at IS NULL
				""";
		int updated = jdbcClient.sql(sql)
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.toString())
				.param("tenantId", tenantId.toString())
				.param("id", id.toString())
				.param("expectedVersion", expectedVersion)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Contact update failed due to concurrent modification");
		}
	}

	@Override
	public void transferAccount(TenantId tenantId, ContactId id, AccountId newAccountId,
			String jobTitle, long expectedVersion, ActorId actorId, java.time.Instant now) {
		String sql = """
				UPDATE crm_contacts
				SET account_id = :newAccountId,
				    job_title = COALESCE(:jobTitle, job_title),
				    updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				  AND deleted_at IS NULL
				""";
		int updated = jdbcClient.sql(sql)
				.param("newAccountId", newAccountId.toString())
				.param("jobTitle", jobTitle)
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.toString())
				.param("tenantId", tenantId.toString())
				.param("id", id.toString())
				.param("expectedVersion", expectedVersion)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Contact update failed due to concurrent modification");
		}
	}

	@Override
	public int bulkUpdateLifecycle(TenantId tenantId, List<ContactId> ids, String lifecycleStage,
			ActorId actorId, java.time.Instant now) {
		if (ids == null || ids.isEmpty()) return 0;
		List<String> idStrings = ids.stream().map(ContactId::toString).toList();
		String sql = """
				UPDATE crm_contacts
				SET lifecycle_stage = :stage,
				    updated_at = :now,
				    updated_by = :actorId,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND id IN (:ids)
				  AND deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("stage", lifecycleStage.toUpperCase().trim())
				.param("now", Timestamp.from(now))
				.param("actorId", actorId.toString())
				.param("tenantId", tenantId.toString())
				.param("ids", idStrings)
				.update();
	}

}
