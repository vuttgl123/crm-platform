package com.crm.customer.config.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.domain.LeadSource;
import com.crm.customer.config.domain.LeadSourceId;
import com.crm.customer.config.domain.LeadStatus;
import com.crm.customer.config.domain.LeadStatusCategory;
import com.crm.customer.config.domain.LeadStatusId;
import com.crm.customer.config.domain.OpportunityLostReason;
import com.crm.customer.config.domain.OpportunityLostReasonId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class SalesConfigJdbcMapper {

	private SalesConfigJdbcMapper() {
	}

	public static LeadSource mapLeadSource(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		LeadSourceId id = LeadSourceId.from(rs.getObject("id", UUID.class));
		String sourceCode = rs.getString("source_code");
		String name = rs.getString("name");
		String description = rs.getString("description");
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

		return new LeadSource(tenantId, id, sourceCode, name, description, active, auditInfo, version);
	}

	public static LeadSourceDetails mapLeadSourceDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String sourceCode = rs.getString("source_code");
		String name = rs.getString("name");
		String description = rs.getString("description");
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new LeadSourceDetails(id, sourceCode, name, description, active, createdBy, createdAt, updatedBy, updatedAt, version);
	}

	public static LeadStatus mapLeadStatus(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		LeadStatusId id = LeadStatusId.from(rs.getObject("id", UUID.class));
		String statusCode = rs.getString("status_code");
		String name = rs.getString("name");
		String statusCategoryStr = rs.getString("status_category");
		LeadStatusCategory statusCategory = statusCategoryStr != null ? LeadStatusCategory.valueOf(statusCategoryStr) : LeadStatusCategory.OPEN;
		int displayOrder = rs.getInt("display_order");
		boolean defaultStatus = rs.getBoolean("is_default");
		boolean terminal = rs.getBoolean("is_terminal");
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

		return new LeadStatus(tenantId, id, statusCode, name, statusCategory, displayOrder, defaultStatus, terminal, active, auditInfo, version);
	}

	public static LeadStatusDetails mapLeadStatusDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String statusCode = rs.getString("status_code");
		String name = rs.getString("name");
		String statusCategoryStr = rs.getString("status_category");
		LeadStatusCategory statusCategory = statusCategoryStr != null ? LeadStatusCategory.valueOf(statusCategoryStr) : LeadStatusCategory.OPEN;
		int displayOrder = rs.getInt("display_order");
		boolean defaultStatus = rs.getBoolean("is_default");
		boolean terminal = rs.getBoolean("is_terminal");
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new LeadStatusDetails(id, statusCode, name, statusCategory, displayOrder, defaultStatus, terminal, active, createdBy, createdAt, updatedBy, updatedAt, version);
	}

	public static OpportunityLostReason mapLostReason(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		OpportunityLostReasonId id = OpportunityLostReasonId.from(rs.getObject("id", UUID.class));
		String reasonCode = rs.getString("reason_code");
		String name = rs.getString("name");
		String description = rs.getString("description");
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

		return new OpportunityLostReason(tenantId, id, reasonCode, name, description, active, auditInfo, version);
	}

	public static OpportunityLostReasonDetails mapLostReasonDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String reasonCode = rs.getString("reason_code");
		String name = rs.getString("name");
		String description = rs.getString("description");
		boolean active = rs.getBoolean("is_active");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new OpportunityLostReasonDetails(id, reasonCode, name, description, active, createdBy, createdAt, updatedBy, updatedAt, version);
	}

}
