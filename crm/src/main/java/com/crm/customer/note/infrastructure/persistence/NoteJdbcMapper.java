package com.crm.customer.note.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.domain.Note;
import com.crm.customer.note.domain.NoteId;
import com.crm.customer.note.domain.NoteVisibility;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.SoftDeleteInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class NoteJdbcMapper {

	private NoteJdbcMapper() {
	}

	public static Note mapNote(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		NoteId id = NoteId.from(rs.getObject("id", UUID.class));
		String title = rs.getString("title");
		String body = rs.getString("body");

		String visibilityStr = rs.getString("visibility");
		NoteVisibility visibility = visibilityStr != null ? NoteVisibility.valueOf(visibilityStr) : NoteVisibility.TENANT;

		UUID ownerUserId = rs.getObject("owner_user_id", UUID.class);
		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		UUID opportunityId = rs.getObject("opportunity_id", UUID.class);
		UUID activityId = rs.getObject("activity_id", UUID.class);
		UUID ticketId = rs.getObject("ticket_id", UUID.class);

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		UUID deletedByUuid = rs.getObject("deleted_by", UUID.class);
		ActorId deletedBy = deletedByUuid != null ? new ActorId(deletedByUuid) : null;
		Timestamp deletedAtTs = rs.getTimestamp("deleted_at");
		Instant deletedAt = deletedAtTs != null ? deletedAtTs.toInstant() : null;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);
		SoftDeleteInfo softDeleteInfo = SoftDeleteInfo.restore(deletedAt, deletedBy);

		return new Note(
				tenantId,
				id,
				title,
				body,
				visibility,
				ownerUserId,
				accountId,
				contactId,
				leadId,
				opportunityId,
				activityId,
				ticketId,
				auditInfo,
				softDeleteInfo,
				version
		);
	}

	public static NoteSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String title = rs.getString("title");
		String body = rs.getString("body");
		String bodyPreview = body != null ? (body.length() > 100 ? body.substring(0, 100) + "..." : body) : "";

		String visibilityStr = rs.getString("visibility");
		NoteVisibility visibility = visibilityStr != null ? NoteVisibility.valueOf(visibilityStr) : NoteVisibility.TENANT;

		UUID ownerUserId = rs.getObject("owner_user_id", UUID.class);
		String ownerDisplayName = rs.getString("owner_display_name");
		UUID accountId = rs.getObject("account_id", UUID.class);
		UUID contactId = rs.getObject("contact_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		UUID opportunityId = rs.getObject("opportunity_id", UUID.class);
		UUID activityId = rs.getObject("activity_id", UUID.class);
		UUID ticketId = rs.getObject("ticket_id", UUID.class);

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new NoteSummary(
				id,
				title,
				bodyPreview,
				visibility,
				ownerUserId,
				ownerDisplayName,
				accountId,
				contactId,
				leadId,
				opportunityId,
				activityId,
				ticketId,
				createdAt,
				updatedAt,
				version
		);
	}

}
