package com.crm.service.ticket.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketSummary;
import com.crm.service.ticket.application.port.TicketRepository;
import com.crm.service.ticket.application.query.TicketSearchQuery;
import com.crm.service.ticket.domain.Ticket;
import com.crm.service.ticket.domain.TicketComment;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTicketRepository implements TicketRepository {

	private static final String TICKET_SELECT = """
			SELECT t.tenant_id, t.id, t.ticket_number, t.account_id, t.contact_id,
			       t.subject, t.description, t.channel, t.category_id, t.priority,
			       t.severity, t.status, t.assigned_user_id, t.assigned_team_id,
			       t.owner_user_id, t.sla_policy_id, t.external_reference,
			       t.first_response_due_at, t.resolution_due_at, t.first_responded_at,
			       t.resolved_at, t.closed_at, t.satisfaction_score, t.satisfaction_comment,
			       t.created_at, t.updated_at, t.created_by, t.updated_by, t.version
			FROM service.tickets t
			""";

	private static final String SUMMARY_SELECT = """
			SELECT t.id, t.ticket_number, t.account_id, a.name AS account_name,
			       t.contact_id,
			       NULLIF(TRIM(CONCAT(ct.first_name, ' ', ct.last_name)), '') AS contact_name,
			       t.subject, t.channel, t.category_id, tc.name AS category_name,
			       t.priority, t.severity, t.status, t.assigned_user_id,
			       u.email AS assigned_user_name,
			       t.assigned_team_id, tm.name AS assigned_team_name,
			       t.first_response_due_at, t.resolution_due_at, t.resolved_at,
			       t.closed_at,
			       (SELECT COUNT(*) FROM service.ticket_comments c WHERE c.tenant_id = t.tenant_id AND c.ticket_id = t.id AND c.deleted_at IS NULL) AS comments_count,
			       t.updated_at, t.version
			FROM service.tickets t
			LEFT JOIN crm.accounts a ON a.tenant_id = t.tenant_id AND a.id = t.account_id
			LEFT JOIN crm.contacts ct ON ct.tenant_id = t.tenant_id AND ct.id = t.contact_id
			LEFT JOIN service.ticket_categories tc ON tc.tenant_id = t.tenant_id AND tc.id = t.category_id
			LEFT JOIN platform.teams tm ON tm.tenant_id = t.tenant_id AND tm.id = t.assigned_team_id
			LEFT JOIN platform.users u ON u.id = t.assigned_user_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcTicketRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Ticket> findById(TenantId tenantId, TicketId id) {
		String sql = TICKET_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND t.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(TicketJdbcMapper::mapTicket)
				.optional();
	}

	@Override
	public Optional<Ticket> findByTicketNumber(TenantId tenantId, String ticketNumber) {
		String sql = TICKET_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND t.ticket_number = :ticketNumber
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("ticketNumber", ticketNumber)
				.query(TicketJdbcMapper::mapTicket)
				.optional();
	}

	@Override
	public boolean existsByTicketNumber(TenantId tenantId, String ticketNumber) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM service.tickets t
				WHERE t.tenant_id = :tenantId
				  AND t.ticket_number = :ticketNumber
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("ticketNumber", ticketNumber)
				.query(Boolean.class)
				.single());
	}

	@Override
	public PageResult<TicketSummary> search(TenantId tenantId, TicketSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE t.tenant_id = :tenantId ");

		if (query.search() != null && !query.search().isBlank()) {
			params.put("search", "%" + query.search().trim().toLowerCase() + "%");
			whereClause.append(" AND (LOWER(t.ticket_number) LIKE :search OR LOWER(t.subject) LIKE :search OR LOWER(COALESCE(t.description, '')) LIKE :search) ");
		}
		if (query.accountId() != null) {
			params.put("accountId", query.accountId());
			whereClause.append(" AND t.account_id = :accountId ");
		}
		if (query.contactId() != null) {
			params.put("contactId", query.contactId());
			whereClause.append(" AND t.contact_id = :contactId ");
		}
		if (query.categoryId() != null) {
			params.put("categoryId", query.categoryId());
			whereClause.append(" AND t.category_id = :categoryId ");
		}
		if (query.status() != null) {
			params.put("status", query.status().name());
			whereClause.append(" AND t.status = :status ");
		}
		if (query.priority() != null) {
			params.put("priority", query.priority().name());
			whereClause.append(" AND t.priority = :priority ");
		}
		if (query.assignedUserId() != null) {
			params.put("assignedUserId", query.assignedUserId());
			whereClause.append(" AND t.assigned_user_id = :assignedUserId ");
		}
		if (query.assignedTeamId() != null) {
			params.put("assignedTeamId", query.assignedTeamId());
			whereClause.append(" AND t.assigned_team_id = :assignedTeamId ");
		}

		String countSql = "SELECT COUNT(*) FROM service.tickets t " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset";
		List<TicketSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(TicketJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public List<TicketCommentDetails> findCommentsByTicketId(TenantId tenantId, TicketId ticketId) {
		String sql = """
				SELECT c.id, c.ticket_id, c.author_user_id, u.email AS author_user_name,
				       c.author_contact_id,
				       NULLIF(TRIM(CONCAT(ct.first_name, ' ', ct.last_name)), '') AS author_contact_name,
				       c.body, c.visibility, c.channel, c.external_message_id,
				       c.created_by, c.created_at, c.updated_by, c.updated_at, c.version
				FROM service.ticket_comments c
				LEFT JOIN platform.users u ON u.id = c.author_user_id
				LEFT JOIN crm.contacts ct ON ct.tenant_id = c.tenant_id AND ct.id = c.author_contact_id
				WHERE c.tenant_id = :tenantId
				  AND c.ticket_id = :ticketId
				  AND c.deleted_at IS NULL
				ORDER BY c.created_at ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("ticketId", ticketId.value())
				.query(TicketJdbcMapper::mapCommentDetails)
				.list();
	}

	@Override
	public Optional<TicketComment> findCommentById(TenantId tenantId, TicketCommentId commentId) {
		String sql = """
				SELECT c.tenant_id, c.id, c.ticket_id, c.author_user_id,
				       c.author_contact_id, c.body, c.visibility, c.channel,
				       c.external_message_id, c.created_at, c.updated_at,
				       c.created_by, c.updated_by, c.deleted_at, c.deleted_by, c.version
				FROM service.ticket_comments c
				WHERE c.tenant_id = :tenantId
				  AND c.id = :id
				  AND c.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", commentId.value())
				.query(TicketJdbcMapper::mapComment)
				.optional();
	}

	@Override
	public void insert(Ticket ticket) {
		String sql = """
				INSERT INTO service.tickets (
				    tenant_id, id, ticket_number, account_id, contact_id,
				    subject, description, channel, category_id, priority,
				    severity, status, assigned_user_id, assigned_team_id,
				    owner_user_id, sla_policy_id, external_reference,
				    first_response_due_at, resolution_due_at, first_responded_at,
				    resolved_at, closed_at, satisfaction_score, satisfaction_comment,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :ticketNumber, :accountId, :contactId,
				    :subject, :description, :channel, :categoryId, :priority,
				    :severity, :status, :assignedUserId, :assignedTeamId,
				    :ownerUserId, :slaPolicyId, :externalReference,
				    :firstResponseDueAt, :resolutionDueAt, :firstRespondedAt,
				    :resolvedAt, :closedAt, :satisfactionScore, :satisfactionComment,
				    :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", ticket.tenantId().value())
				.param("id", ticket.id().value())
				.param("ticketNumber", ticket.ticketNumber())
				.param("accountId", ticket.accountId() != null ? ticket.accountId().value() : null)
				.param("contactId", ticket.contactId() != null ? ticket.contactId().value() : null)
				.param("subject", ticket.subject())
				.param("description", ticket.description())
				.param("channel", ticket.channel().name())
				.param("categoryId", ticket.categoryId() != null ? ticket.categoryId().value() : null)
				.param("priority", ticket.priority().name())
				.param("severity", ticket.severity())
				.param("status", ticket.status().name())
				.param("assignedUserId", ticket.assignedUserId() != null ? ticket.assignedUserId().value() : null)
				.param("assignedTeamId", ticket.assignedTeamId())
				.param("ownerUserId", ticket.ownerUserId() != null ? ticket.ownerUserId().value() : null)
				.param("slaPolicyId", ticket.slaPolicyId())
				.param("externalReference", ticket.externalReference())
				.param("firstResponseDueAt", ticket.firstResponseDueAt() != null ? Timestamp.from(ticket.firstResponseDueAt()) : null)
				.param("resolutionDueAt", ticket.resolutionDueAt() != null ? Timestamp.from(ticket.resolutionDueAt()) : null)
				.param("firstRespondedAt", ticket.firstRespondedAt() != null ? Timestamp.from(ticket.firstRespondedAt()) : null)
				.param("resolvedAt", ticket.resolvedAt() != null ? Timestamp.from(ticket.resolvedAt()) : null)
				.param("closedAt", ticket.closedAt() != null ? Timestamp.from(ticket.closedAt()) : null)
				.param("satisfactionScore", ticket.satisfactionScore())
				.param("satisfactionComment", ticket.satisfactionComment())
				.param("createdAt", Timestamp.from(ticket.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(ticket.auditInfo().updatedAt()))
				.param("createdBy", ticket.auditInfo().createdBy() != null ? ticket.auditInfo().createdBy().value() : null)
				.param("updatedBy", ticket.auditInfo().updatedBy() != null ? ticket.auditInfo().updatedBy().value() : null)
				.param("version", ticket.version())
				.update();
	}

	@Override
	public void update(Ticket ticket) {
		String sql = """
				UPDATE service.tickets
				SET account_id = :accountId,
				    contact_id = :contactId,
				    subject = :subject,
				    description = :description,
				    channel = :channel,
				    category_id = :categoryId,
				    priority = :priority,
				    severity = :severity,
				    status = :status,
				    assigned_user_id = :assignedUserId,
				    assigned_team_id = :assignedTeamId,
				    owner_user_id = :ownerUserId,
				    sla_policy_id = :slaPolicyId,
				    external_reference = :externalReference,
				    first_responded_at = :firstRespondedAt,
				    resolved_at = :resolvedAt,
				    closed_at = :closedAt,
				    satisfaction_score = :satisfactionScore,
				    satisfaction_comment = :satisfactionComment,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", ticket.tenantId().value())
				.param("id", ticket.id().value())
				.param("accountId", ticket.accountId() != null ? ticket.accountId().value() : null)
				.param("contactId", ticket.contactId() != null ? ticket.contactId().value() : null)
				.param("subject", ticket.subject())
				.param("description", ticket.description())
				.param("channel", ticket.channel().name())
				.param("categoryId", ticket.categoryId() != null ? ticket.categoryId().value() : null)
				.param("priority", ticket.priority().name())
				.param("severity", ticket.severity())
				.param("status", ticket.status().name())
				.param("assignedUserId", ticket.assignedUserId() != null ? ticket.assignedUserId().value() : null)
				.param("assignedTeamId", ticket.assignedTeamId())
				.param("ownerUserId", ticket.ownerUserId() != null ? ticket.ownerUserId().value() : null)
				.param("slaPolicyId", ticket.slaPolicyId())
				.param("externalReference", ticket.externalReference())
				.param("firstRespondedAt", ticket.firstRespondedAt() != null ? Timestamp.from(ticket.firstRespondedAt()) : null)
				.param("resolvedAt", ticket.resolvedAt() != null ? Timestamp.from(ticket.resolvedAt()) : null)
				.param("closedAt", ticket.closedAt() != null ? Timestamp.from(ticket.closedAt()) : null)
				.param("satisfactionScore", ticket.satisfactionScore())
				.param("satisfactionComment", ticket.satisfactionComment())
				.param("updatedAt", Timestamp.from(ticket.auditInfo().updatedAt()))
				.param("updatedBy", ticket.auditInfo().updatedBy() != null ? ticket.auditInfo().updatedBy().value() : null)
				.param("newVersion", ticket.version())
				.param("expectedVersion", ticket.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Ticket update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, TicketId id, long version) {
		String sql = """
				DELETE FROM service.tickets
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :version
				""";
		int deleted = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.param("version", version)
				.update();
		if (deleted == 0) {
			throw new IllegalStateException("Ticket delete failed due to version mismatch");
		}
	}

	@Override
	public void insertComment(TicketComment comment) {
		String sql = """
				INSERT INTO service.ticket_comments (
				    tenant_id, id, ticket_id, author_user_id, author_contact_id,
				    body, visibility, channel, external_message_id, created_at,
				    updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :ticketId, :authorUserId, :authorContactId,
				    :body, :visibility, :channel, :externalMessageId, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", comment.tenantId().value())
				.param("id", comment.id().value())
				.param("ticketId", comment.ticketId().value())
				.param("authorUserId", comment.authorUserId() != null ? comment.authorUserId().value() : null)
				.param("authorContactId", comment.authorContactId() != null ? comment.authorContactId().value() : null)
				.param("body", comment.body())
				.param("visibility", comment.visibility().name())
				.param("channel", comment.channel())
				.param("externalMessageId", comment.externalMessageId())
				.param("createdAt", Timestamp.from(comment.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(comment.auditInfo().updatedAt()))
				.param("createdBy", comment.auditInfo().createdBy() != null ? comment.auditInfo().createdBy().value() : null)
				.param("updatedBy", comment.auditInfo().updatedBy() != null ? comment.auditInfo().updatedBy().value() : null)
				.param("version", comment.version())
				.update();
	}

	@Override
	public void updateComment(TicketComment comment) {
		String sql = """
				UPDATE service.ticket_comments
				SET body = :body,
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
				.param("tenantId", comment.tenantId().value())
				.param("id", comment.id().value())
				.param("body", comment.body())
				.param("visibility", comment.visibility().name())
				.param("updatedAt", Timestamp.from(comment.auditInfo().updatedAt()))
				.param("updatedBy", comment.auditInfo().updatedBy() != null ? comment.auditInfo().updatedBy().value() : null)
				.param("deletedAt", comment.deletedAt() != null ? Timestamp.from(comment.deletedAt()) : null)
				.param("deletedBy", comment.deletedBy() != null ? comment.deletedBy().value() : null)
				.param("newVersion", comment.version())
				.param("expectedVersion", comment.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("TicketComment update failed due to version mismatch");
		}
	}

}
