package com.crm.customer.tag.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.application.port.TagRepository;
import com.crm.customer.tag.domain.EntityTag;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.Tag;
import com.crm.customer.tag.domain.TagId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTagRepository implements TagRepository {

	private static final String TAG_SELECT = """
			SELECT t.tenant_id, t.id, t.tag_key, t.name, t.description,
			       t.color_hex, t.is_active, t.created_at, t.updated_at,
			       t.created_by, t.updated_by, t.version
			FROM crm.tags t
			""";

	private static final String ENTITY_TAG_SELECT = """
			SELECT et.tenant_id, et.tag_id, et.id, et.account_id, et.contact_id,
			       et.lead_id, et.opportunity_id, et.activity_id, et.ticket_id,
			       et.created_at, et.created_by
			FROM crm.entity_tags et
			""";

	private static final String ENTITY_TAG_DETAILS_SELECT = """
			SELECT et.id, et.tag_id, t.tag_key, t.name AS tag_name, t.color_hex,
			       et.account_id, et.contact_id, et.lead_id, et.opportunity_id,
			       et.activity_id, et.ticket_id, et.created_at, et.created_by
			FROM crm.entity_tags et
			JOIN crm.tags t ON t.tenant_id = et.tenant_id AND t.id = et.tag_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcTagRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Tag> findById(TenantId tenantId, TagId id) {
		String sql = TAG_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND t.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(TagJdbcMapper::mapTag)
				.optional();
	}

	@Override
	public Optional<Tag> findByKey(TenantId tenantId, String tagKey) {
		String sql = TAG_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND lower(t.tag_key) = lower(:tagKey)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("tagKey", tagKey.trim())
				.query(TagJdbcMapper::mapTag)
				.optional();
	}

	@Override
	public boolean existsByKey(TenantId tenantId, String tagKey) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.tags t
				WHERE t.tenant_id = :tenantId
				  AND lower(t.tag_key) = lower(:tagKey)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("tagKey", tagKey.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<TagDetails> findAll(TenantId tenantId) {
		String sql = TAG_SELECT + """
				WHERE t.tenant_id = :tenantId
				ORDER BY t.tag_key ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(TagJdbcMapper::mapDetails)
				.list();
	}

	@Override
	public void insert(Tag tag) {
		String sql = """
				INSERT INTO crm.tags (
				    tenant_id, id, tag_key, name, description,
				    color_hex, is_active, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :tagKey, :name, :description,
				    :colorHex, :active, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tag.tenantId().value())
				.param("id", tag.id().value())
				.param("tagKey", tag.tagKey())
				.param("name", tag.name())
				.param("description", tag.description())
				.param("colorHex", tag.colorHex())
				.param("active", tag.isActive())
				.param("createdAt", Timestamp.from(tag.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(tag.auditInfo().updatedAt()))
				.param("createdBy", tag.auditInfo().createdBy() != null ? tag.auditInfo().createdBy().value() : null)
				.param("updatedBy", tag.auditInfo().updatedBy() != null ? tag.auditInfo().updatedBy().value() : null)
				.param("version", tag.version())
				.update();
	}

	@Override
	public void update(Tag tag) {
		String sql = """
				UPDATE crm.tags
				SET name = :name,
				    description = :description,
				    color_hex = :colorHex,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", tag.tenantId().value())
				.param("id", tag.id().value())
				.param("name", tag.name())
				.param("description", tag.description())
				.param("colorHex", tag.colorHex())
				.param("active", tag.isActive())
				.param("updatedAt", Timestamp.from(tag.auditInfo().updatedAt()))
				.param("updatedBy", tag.auditInfo().updatedBy() != null ? tag.auditInfo().updatedBy().value() : null)
				.param("newVersion", tag.version())
				.param("expectedVersion", tag.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Tag update failed due to version mismatch");
		}
	}

	@Override
	public void insertEntityTag(EntityTag entityTag) {
		String sql = """
				INSERT INTO crm.entity_tags (
				    tenant_id, tag_id, id, account_id, contact_id,
				    lead_id, opportunity_id, activity_id, ticket_id,
				    created_at, created_by
				) VALUES (
				    :tenantId, :tagId, :id, :accountId, :contactId,
				    :leadId, :opportunityId, :activityId, :ticketId,
				    :createdAt, :createdBy
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", entityTag.tenantId().value())
				.param("tagId", entityTag.tagId().value())
				.param("id", entityTag.id().value())
				.param("accountId", entityTag.accountId())
				.param("contactId", entityTag.contactId())
				.param("leadId", entityTag.leadId())
				.param("opportunityId", entityTag.opportunityId())
				.param("activityId", entityTag.activityId())
				.param("ticketId", entityTag.ticketId())
				.param("createdAt", Timestamp.from(entityTag.createdAt()))
				.param("createdBy", entityTag.createdBy() != null ? entityTag.createdBy().value() : null)
				.update();
	}

	@Override
	public void deleteEntityTag(TenantId tenantId, EntityTagId id) {
		String sql = """
				DELETE FROM crm.entity_tags
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();
	}

	@Override
	public Optional<EntityTag> findEntityTag(TenantId tenantId, EntityTagId id) {
		String sql = ENTITY_TAG_SELECT + """
				WHERE et.tenant_id = :tenantId
				  AND et.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(TagJdbcMapper::mapEntityTag)
				.optional();
	}

	@Override
	public List<EntityTagDetails> findEntityTagsByTarget(
			TenantId tenantId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId) {
		StringBuilder whereClause = new StringBuilder("WHERE et.tenant_id = :tenantId ");
		if (accountId != null) whereClause.append("AND et.account_id = :accountId ");
		if (contactId != null) whereClause.append("AND et.contact_id = :contactId ");
		if (leadId != null) whereClause.append("AND et.lead_id = :leadId ");
		if (opportunityId != null) whereClause.append("AND et.opportunity_id = :opportunityId ");
		if (activityId != null) whereClause.append("AND et.activity_id = :activityId ");
		if (ticketId != null) whereClause.append("AND et.ticket_id = :ticketId ");

		String sql = ENTITY_TAG_DETAILS_SELECT + whereClause + "ORDER BY t.name ASC";
		var spec = jdbcClient.sql(sql).param("tenantId", tenantId.value());

		if (accountId != null) spec.param("accountId", accountId);
		if (contactId != null) spec.param("contactId", contactId);
		if (leadId != null) spec.param("leadId", leadId);
		if (opportunityId != null) spec.param("opportunityId", opportunityId);
		if (activityId != null) spec.param("activityId", activityId);
		if (ticketId != null) spec.param("ticketId", ticketId);

		return spec.query(TagJdbcMapper::mapEntityTagDetails).list();
	}

	@Override
	public boolean existsEntityTag(
			TenantId tenantId,
			TagId tagId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId) {
		StringBuilder whereClause = new StringBuilder("WHERE et.tenant_id = :tenantId AND et.tag_id = :tagId ");
		if (accountId != null) whereClause.append("AND et.account_id = :accountId ");
		if (contactId != null) whereClause.append("AND et.contact_id = :contactId ");
		if (leadId != null) whereClause.append("AND et.lead_id = :leadId ");
		if (opportunityId != null) whereClause.append("AND et.opportunity_id = :opportunityId ");
		if (activityId != null) whereClause.append("AND et.activity_id = :activityId ");
		if (ticketId != null) whereClause.append("AND et.ticket_id = :ticketId ");

		String sql = "SELECT COUNT(*) > 0 FROM crm.entity_tags et " + whereClause;
		var spec = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("tagId", tagId.value());

		if (accountId != null) spec.param("accountId", accountId);
		if (contactId != null) spec.param("contactId", contactId);
		if (leadId != null) spec.param("leadId", leadId);
		if (opportunityId != null) spec.param("opportunityId", opportunityId);
		if (activityId != null) spec.param("activityId", activityId);
		if (ticketId != null) spec.param("ticketId", ticketId);

		return Boolean.TRUE.equals(spec.query(Boolean.class).single());
	}

}
