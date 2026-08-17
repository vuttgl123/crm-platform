package com.crm.service.ticket.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketSummary;
import com.crm.service.ticket.domain.CommentVisibility;
import com.crm.service.ticket.domain.Ticket;
import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketComment;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TicketJdbcMapper {

	private TicketJdbcMapper() {
	}

	public static Ticket mapTicket(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TicketId id = TicketId.from(rs.getObject("id", UUID.class));
		String ticketNumber = rs.getString("ticket_number");

		UUID accountUuid = rs.getObject("account_id", UUID.class);
		AccountId accountId = accountUuid != null ? AccountId.from(accountUuid) : null;

		UUID contactUuid = rs.getObject("contact_id", UUID.class);
		ContactId contactId = contactUuid != null ? ContactId.from(contactUuid) : null;

		String subject = rs.getString("subject");
		String description = rs.getString("description");

		String channelStr = rs.getString("channel");
		TicketChannel channel = channelStr != null ? TicketChannel.valueOf(channelStr) : TicketChannel.WEB;

		UUID categoryUuid = rs.getObject("category_id", UUID.class);
		TicketCategoryId categoryId = categoryUuid != null ? TicketCategoryId.from(categoryUuid) : null;

		String priorityStr = rs.getString("priority");
		TicketPriority priority = priorityStr != null ? TicketPriority.valueOf(priorityStr) : TicketPriority.NORMAL;

		String severity = rs.getString("severity");

		String statusStr = rs.getString("status");
		TicketStatus status = statusStr != null ? TicketStatus.valueOf(statusStr) : TicketStatus.NEW;

		UUID assignedUserUuid = rs.getObject("assigned_user_id", UUID.class);
		ActorId assignedUserId = assignedUserUuid != null ? new ActorId(assignedUserUuid) : null;

		UUID assignedTeamId = rs.getObject("assigned_team_id", UUID.class);

		UUID ownerUserUuid = rs.getObject("owner_user_id", UUID.class);
		ActorId ownerUserId = ownerUserUuid != null ? new ActorId(ownerUserUuid) : null;

		UUID slaPolicyId = rs.getObject("sla_policy_id", UUID.class);
		String externalReference = rs.getString("external_reference");

		Timestamp firstResponseDueAtTs = rs.getTimestamp("first_response_due_at");
		Instant firstResponseDueAt = firstResponseDueAtTs != null ? firstResponseDueAtTs.toInstant() : null;

		Timestamp resolutionDueAtTs = rs.getTimestamp("resolution_due_at");
		Instant resolutionDueAt = resolutionDueAtTs != null ? resolutionDueAtTs.toInstant() : null;

		Timestamp firstRespondedAtTs = rs.getTimestamp("first_responded_at");
		Instant firstRespondedAt = firstRespondedAtTs != null ? firstRespondedAtTs.toInstant() : null;

		Timestamp resolvedAtTs = rs.getTimestamp("resolved_at");
		Instant resolvedAt = resolvedAtTs != null ? resolvedAtTs.toInstant() : null;

		Timestamp closedAtTs = rs.getTimestamp("closed_at");
		Instant closedAt = closedAtTs != null ? closedAtTs.toInstant() : null;

		int score = rs.getInt("satisfaction_score");
		Integer satisfactionScore = rs.wasNull() ? null : score;

		String satisfactionComment = rs.getString("satisfaction_comment");

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

		return new Ticket(tenantId, id, ticketNumber, accountId, contactId, subject,
				description, channel, categoryId, priority, severity, status,
				assignedUserId, assignedTeamId, ownerUserId, slaPolicyId,
				externalReference, firstResponseDueAt, resolutionDueAt,
				firstRespondedAt, resolvedAt, closedAt, satisfactionScore,
				satisfactionComment, auditInfo, version);
	}

	public static TicketSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String ticketNumber = rs.getString("ticket_number");
		UUID accountId = rs.getObject("account_id", UUID.class);
		String accountName = rs.getString("account_name");
		UUID contactId = rs.getObject("contact_id", UUID.class);
		String contactName = rs.getString("contact_name");
		String subject = rs.getString("subject");

		String channelStr = rs.getString("channel");
		TicketChannel channel = channelStr != null ? TicketChannel.valueOf(channelStr) : TicketChannel.WEB;

		UUID categoryId = rs.getObject("category_id", UUID.class);
		String categoryName = rs.getString("category_name");

		String priorityStr = rs.getString("priority");
		TicketPriority priority = priorityStr != null ? TicketPriority.valueOf(priorityStr) : TicketPriority.NORMAL;

		String severity = rs.getString("severity");

		String statusStr = rs.getString("status");
		TicketStatus status = statusStr != null ? TicketStatus.valueOf(statusStr) : TicketStatus.NEW;

		UUID assignedUserId = rs.getObject("assigned_user_id", UUID.class);
		String assignedUserName = rs.getString("assigned_user_name");
		UUID assignedTeamId = rs.getObject("assigned_team_id", UUID.class);
		String assignedTeamName = rs.getString("assigned_team_name");

		Timestamp firstResponseDueAtTs = rs.getTimestamp("first_response_due_at");
		Instant firstResponseDueAt = firstResponseDueAtTs != null ? firstResponseDueAtTs.toInstant() : null;

		Timestamp resolutionDueAtTs = rs.getTimestamp("resolution_due_at");
		Instant resolutionDueAt = resolutionDueAtTs != null ? resolutionDueAtTs.toInstant() : null;

		Timestamp resolvedAtTs = rs.getTimestamp("resolved_at");
		Instant resolvedAt = resolvedAtTs != null ? resolvedAtTs.toInstant() : null;

		Timestamp closedAtTs = rs.getTimestamp("closed_at");
		Instant closedAt = closedAtTs != null ? closedAtTs.toInstant() : null;

		int commentsCount = rs.getInt("comments_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new TicketSummary(id, ticketNumber, accountId, accountName, contactId,
				contactName, subject, channel, categoryId, categoryName, priority,
				severity, status, assignedUserId, assignedUserName, assignedTeamId,
				assignedTeamName, firstResponseDueAt, resolutionDueAt, resolvedAt,
				closedAt, commentsCount, updatedAt, version);
	}

	public static TicketCommentDetails mapCommentDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID ticketId = rs.getObject("ticket_id", UUID.class);
		UUID authorUserId = rs.getObject("author_user_id", UUID.class);
		String authorUserName = rs.getString("author_user_name");
		UUID authorContactId = rs.getObject("author_contact_id", UUID.class);
		String authorContactName = rs.getString("author_contact_name");
		String body = rs.getString("body");

		String visibilityStr = rs.getString("visibility");
		CommentVisibility visibility = visibilityStr != null ? CommentVisibility.valueOf(visibilityStr) : CommentVisibility.PUBLIC;

		String channel = rs.getString("channel");
		String externalMessageId = rs.getString("external_message_id");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new TicketCommentDetails(id, ticketId, authorUserId, authorUserName,
				authorContactId, authorContactName, body, visibility, channel,
				externalMessageId, createdBy, createdAt, updatedBy, updatedAt, version);
	}

	public static TicketComment mapComment(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TicketCommentId id = TicketCommentId.from(rs.getObject("id", UUID.class));
		TicketId ticketId = TicketId.from(rs.getObject("ticket_id", UUID.class));

		UUID authorUserUuid = rs.getObject("author_user_id", UUID.class);
		ActorId authorUserId = authorUserUuid != null ? new ActorId(authorUserUuid) : null;

		UUID authorContactUuid = rs.getObject("author_contact_id", UUID.class);
		ContactId authorContactId = authorContactUuid != null ? ContactId.from(authorContactUuid) : null;

		String body = rs.getString("body");

		String visibilityStr = rs.getString("visibility");
		CommentVisibility visibility = visibilityStr != null ? CommentVisibility.valueOf(visibilityStr) : CommentVisibility.PUBLIC;

		String channel = rs.getString("channel");
		String externalMessageId = rs.getString("external_message_id");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		Timestamp deletedAtTs = rs.getTimestamp("deleted_at");
		Instant deletedAt = deletedAtTs != null ? deletedAtTs.toInstant() : null;
		UUID deletedByUuid = rs.getObject("deleted_by", UUID.class);
		ActorId deletedBy = deletedByUuid != null ? new ActorId(deletedByUuid) : null;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new TicketComment(tenantId, id, ticketId, authorUserId, authorContactId,
				body, visibility, channel, externalMessageId, auditInfo,
				deletedAt, deletedBy, version);
	}

}
