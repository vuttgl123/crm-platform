package com.crm.service.category.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.domain.TicketCategory;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TicketCategoryJdbcMapper {

	private TicketCategoryJdbcMapper() {
	}

	public static TicketCategory mapCategory(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TicketCategoryId id = TicketCategoryId.from(rs.getObject("id", UUID.class));
		String categoryCode = rs.getString("category_code");
		String name = rs.getString("name");
		UUID parentUuid = rs.getObject("parent_category_id", UUID.class);
		TicketCategoryId parentCategoryId = parentUuid != null ? TicketCategoryId.from(parentUuid) : null;
		UUID defaultTeamId = rs.getObject("default_team_id", UUID.class);
		String description = rs.getString("description");
		boolean isActive = rs.getBoolean("is_active");
		long version = rs.getLong("version");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new TicketCategory(tenantId, id, categoryCode, name, parentCategoryId,
				defaultTeamId, description, isActive, auditInfo, version);
	}

	public static TicketCategorySummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String categoryCode = rs.getString("category_code");
		String name = rs.getString("name");
		UUID parentId = rs.getObject("parent_category_id", UUID.class);
		UUID defaultTeamId = rs.getObject("default_team_id", UUID.class);
		String defaultTeamName = rs.getString("default_team_name");
		String description = rs.getString("description");
		boolean isActive = rs.getBoolean("is_active");
		int ticketsCount = rs.getInt("tickets_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new TicketCategorySummary(id, categoryCode, name, parentId, defaultTeamId,
				defaultTeamName, description, isActive, ticketsCount, updatedAt, version);
	}

}
