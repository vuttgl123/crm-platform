package com.crm.customer.tag.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.domain.EntityTag;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.Tag;
import com.crm.customer.tag.domain.TagId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TagJdbcMapper {

	private TagJdbcMapper() {
	}

	public static Tag mapTag(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TagId id = TagId.from(rs.getObject("id", UUID.class));
		String tagKey = rs.getString("tag_key");
		String name = rs.getString("name");
		String description = rs.getString("description");
		String colorHex = rs.getString("color_hex");
		boolean active = rs.getBoolean("is_active");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new Tag(tenantId, id, tagKey, name, description, colorHex, active, auditInfo, version);
	}

	public static TagDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String tagKey = rs.getString("tag_key");
		String name = rs.getString("name");
		String description = rs.getString("description");
		String colorHex = rs.getString("color_hex");
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new TagDetails(id, tagKey, name, description, colorHex, active, createdBy, createdAt, updatedBy, updatedAt, version);
	}

	public static EntityTag mapEntityTag(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TagId tagId = TagId.from(rs.getObject("tag_id", UUID.class));
		EntityTagId id = EntityTagId.from(rs.getObject("id", UUID.class));

		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		UUID opportunityId = rs.getObject("opportunity_id", UUID.class);
		UUID activityId = rs.getObject("activity_id", UUID.class);
		UUID ticketId = rs.getObject("ticket_id", UUID.class);

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;

		return new EntityTag(tenantId, tagId, id, accountId, contactId, leadId, opportunityId, activityId, ticketId, createdAt, createdBy);
	}

	public static EntityTagDetails mapEntityTagDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID tagId = rs.getObject("tag_id", UUID.class);
		String tagKey = rs.getString("tag_key");
		String tagName = rs.getString("tag_name");
		String tagColorHex = rs.getString("color_hex");

		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		UUID opportunityId = rs.getObject("opportunity_id", UUID.class);
		UUID activityId = rs.getObject("activity_id", UUID.class);
		UUID ticketId = rs.getObject("ticket_id", UUID.class);

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdBy = rs.getObject("created_by", UUID.class);

		return new EntityTagDetails(id, tagId, tagKey, tagName, tagColorHex, accountId, contactId, leadId, opportunityId, activityId, ticketId, createdAt, createdBy);
	}

}
