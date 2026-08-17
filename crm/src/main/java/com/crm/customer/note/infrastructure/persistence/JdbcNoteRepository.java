package com.crm.customer.note.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.application.port.NoteRepository;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.domain.Note;
import com.crm.customer.note.domain.NoteId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcNoteRepository implements NoteRepository {

	private static final String NOTE_SELECT = """
			SELECT n.tenant_id, n.id, n.title, n.body, n.visibility,
			       n.owner_user_id, n.account_id, n.contact_id, n.lead_id,
			       n.opportunity_id, n.activity_id, n.ticket_id,
			       n.created_at, n.updated_at, n.created_by, n.updated_by,
			       n.deleted_at, n.deleted_by, n.version
			FROM crm.notes n
			""";

	private static final String SUMMARY_SELECT = """
			SELECT n.id, n.title, n.body, n.visibility, n.owner_user_id,
			       u.display_name AS owner_display_name,
			       n.account_id, n.contact_id, n.lead_id, n.opportunity_id,
			       n.activity_id, n.ticket_id, n.created_at, n.updated_at, n.version
			FROM crm.notes n
			LEFT JOIN platform.users u ON u.id = n.owner_user_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcNoteRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Note> findById(TenantId tenantId, NoteId id) {
		String sql = NOTE_SELECT + """
				WHERE n.tenant_id = :tenantId
				  AND n.id = :id
				  AND n.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(NoteJdbcMapper::mapNote)
				.optional();
	}

	@Override
	public List<NoteSummary> findByTarget(TenantId tenantId, NoteSearchQuery query) {
		StringBuilder whereClause = new StringBuilder("WHERE n.tenant_id = :tenantId AND n.deleted_at IS NULL ");
		if (query.accountId() != null) {
			whereClause.append("AND n.account_id = :accountId ");
		}
		if (query.contactId() != null) {
			whereClause.append("AND n.contact_id = :contactId ");
		}
		if (query.leadId() != null) {
			whereClause.append("AND n.lead_id = :leadId ");
		}
		if (query.opportunityId() != null) {
			whereClause.append("AND n.opportunity_id = :opportunityId ");
		}
		if (query.activityId() != null) {
			whereClause.append("AND n.activity_id = :activityId ");
		}
		if (query.ticketId() != null) {
			whereClause.append("AND n.ticket_id = :ticketId ");
		}

		String sql = SUMMARY_SELECT + whereClause + "ORDER BY n.created_at DESC";
		var spec = jdbcClient.sql(sql).param("tenantId", tenantId.value());

		if (query.accountId() != null) spec.param("accountId", query.accountId());
		if (query.contactId() != null) spec.param("contactId", query.contactId());
		if (query.leadId() != null) spec.param("leadId", query.leadId());
		if (query.opportunityId() != null) spec.param("opportunityId", query.opportunityId());
		if (query.activityId() != null) spec.param("activityId", query.activityId());
		if (query.ticketId() != null) spec.param("ticketId", query.ticketId());

		return spec.query(NoteJdbcMapper::mapSummary).list();
	}

	@Override
	public void insert(Note note) {
		String sql = """
				INSERT INTO crm.notes (
				    tenant_id, id, title, body, visibility,
				    owner_user_id, account_id, contact_id, lead_id,
				    opportunity_id, activity_id, ticket_id,
				    created_at, updated_at, created_by, updated_by,
				    deleted_at, deleted_by, version
				) VALUES (
				    :tenantId, :id, :title, :body, :visibility,
				    :ownerUserId, :accountId, :contactId, :leadId,
				    :opportunityId, :activityId, :ticketId,
				    :createdAt, :updatedAt, :createdBy, :updatedBy,
				    :deletedAt, :deletedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", note.tenantId().value())
				.param("id", note.id().value())
				.param("title", note.title())
				.param("body", note.body())
				.param("visibility", note.visibility().name())
				.param("ownerUserId", note.ownerUserId())
				.param("accountId", note.accountId())
				.param("contactId", note.contactId())
				.param("leadId", note.leadId())
				.param("opportunityId", note.opportunityId())
				.param("activityId", note.activityId())
				.param("ticketId", note.ticketId())
				.param("createdAt", Timestamp.from(note.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(note.auditInfo().updatedAt()))
				.param("createdBy", note.auditInfo().createdBy() != null ? note.auditInfo().createdBy().value() : null)
				.param("updatedBy", note.auditInfo().updatedBy() != null ? note.auditInfo().updatedBy().value() : null)
				.param("deletedAt", note.softDeleteInfo().deletedAt() != null ? Timestamp.from(note.softDeleteInfo().deletedAt()) : null)
				.param("deletedBy", note.softDeleteInfo().deletedBy() != null ? note.softDeleteInfo().deletedBy().value() : null)
				.param("version", note.version())
				.update();
	}

	@Override
	public void update(Note note) {
		String sql = """
				UPDATE crm.notes
				SET title = :title,
				    body = :body,
				    visibility = :visibility,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    deleted_at = :deletedAt,
				    deleted_by = :deletedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", note.tenantId().value())
				.param("id", note.id().value())
				.param("title", note.title())
				.param("body", note.body())
				.param("visibility", note.visibility().name())
				.param("updatedAt", Timestamp.from(note.auditInfo().updatedAt()))
				.param("updatedBy", note.auditInfo().updatedBy() != null ? note.auditInfo().updatedBy().value() : null)
				.param("deletedAt", note.softDeleteInfo().deletedAt() != null ? Timestamp.from(note.softDeleteInfo().deletedAt()) : null)
				.param("deletedBy", note.softDeleteInfo().deletedBy() != null ? note.softDeleteInfo().deletedBy().value() : null)
				.param("newVersion", note.version())
				.param("expectedVersion", note.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Note update failed due to version mismatch");
		}
	}

}
