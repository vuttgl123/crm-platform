package com.crm.customer.config.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.application.port.SalesConfigRepository;
import com.crm.customer.config.domain.LeadSource;
import com.crm.customer.config.domain.LeadSourceId;
import com.crm.customer.config.domain.LeadStatus;
import com.crm.customer.config.domain.LeadStatusId;
import com.crm.customer.config.domain.OpportunityLostReason;
import com.crm.customer.config.domain.OpportunityLostReasonId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSalesConfigRepository implements SalesConfigRepository {

	private static final String LEAD_SOURCE_SELECT = """
			SELECT ls.tenant_id, ls.id, ls.source_code, ls.name, ls.description,
			       ls.is_active, ls.created_at, ls.updated_at, ls.created_by,
			       ls.updated_by, ls.version
			FROM crm.lead_sources ls
			""";

	private static final String LEAD_STATUS_SELECT = """
			SELECT lst.tenant_id, lst.id, lst.status_code, lst.name, lst.status_category,
			       lst.display_order, lst.is_default, lst.is_terminal, lst.is_active,
			       lst.created_at, lst.updated_at, lst.created_by, lst.updated_by, lst.version
			FROM crm.lead_statuses lst
			""";

	private static final String LOST_REASON_SELECT = """
			SELECT olr.tenant_id, olr.id, olr.reason_code, olr.name, olr.description,
			       olr.is_active, olr.created_at, olr.updated_at, olr.created_by,
			       olr.updated_by, olr.version
			FROM crm.opportunity_lost_reasons olr
			""";

	private final JdbcClient jdbcClient;

	public JdbcSalesConfigRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<LeadSource> findLeadSourceById(TenantId tenantId, LeadSourceId id) {
		String sql = LEAD_SOURCE_SELECT + """
				WHERE ls.tenant_id = :tenantId
				  AND ls.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(SalesConfigJdbcMapper::mapLeadSource)
				.optional();
	}

	@Override
	public Optional<LeadSource> findLeadSourceByCode(TenantId tenantId, String sourceCode) {
		String sql = LEAD_SOURCE_SELECT + """
				WHERE ls.tenant_id = :tenantId
				  AND lower(ls.source_code) = lower(:sourceCode)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("sourceCode", sourceCode.trim())
				.query(SalesConfigJdbcMapper::mapLeadSource)
				.optional();
	}

	@Override
	public boolean existsLeadSourceByCode(TenantId tenantId, String sourceCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.lead_sources ls
				WHERE ls.tenant_id = :tenantId
				  AND lower(ls.source_code) = lower(:sourceCode)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("sourceCode", sourceCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<LeadSourceDetails> findAllLeadSources(TenantId tenantId) {
		String sql = LEAD_SOURCE_SELECT + """
				WHERE ls.tenant_id = :tenantId
				ORDER BY ls.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(SalesConfigJdbcMapper::mapLeadSourceDetails)
				.list();
	}

	@Override
	public void insertLeadSource(LeadSource leadSource) {
		String sql = """
				INSERT INTO crm.lead_sources (
				    tenant_id, id, source_code, name, description,
				    is_active, created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :sourceCode, :name, :description,
				    :active, :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", leadSource.tenantId().value())
				.param("id", leadSource.id().value())
				.param("sourceCode", leadSource.sourceCode())
				.param("name", leadSource.name())
				.param("description", leadSource.description())
				.param("active", leadSource.isActive())
				.param("createdAt", Timestamp.from(leadSource.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(leadSource.auditInfo().updatedAt()))
				.param("createdBy", leadSource.auditInfo().createdBy() != null ? leadSource.auditInfo().createdBy().value() : null)
				.param("updatedBy", leadSource.auditInfo().updatedBy() != null ? leadSource.auditInfo().updatedBy().value() : null)
				.param("version", leadSource.version())
				.update();
	}

	@Override
	public void updateLeadSource(LeadSource leadSource) {
		String sql = """
				UPDATE crm.lead_sources
				SET name = :name,
				    description = :description,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", leadSource.tenantId().value())
				.param("id", leadSource.id().value())
				.param("name", leadSource.name())
				.param("description", leadSource.description())
				.param("active", leadSource.isActive())
				.param("updatedAt", Timestamp.from(leadSource.auditInfo().updatedAt()))
				.param("updatedBy", leadSource.auditInfo().updatedBy() != null ? leadSource.auditInfo().updatedBy().value() : null)
				.param("newVersion", leadSource.version())
				.param("expectedVersion", leadSource.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("LeadSource update failed due to version mismatch");
		}
	}

	@Override
	public Optional<LeadStatus> findLeadStatusById(TenantId tenantId, LeadStatusId id) {
		String sql = LEAD_STATUS_SELECT + """
				WHERE lst.tenant_id = :tenantId
				  AND lst.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(SalesConfigJdbcMapper::mapLeadStatus)
				.optional();
	}

	@Override
	public Optional<LeadStatus> findLeadStatusByCode(TenantId tenantId, String statusCode) {
		String sql = LEAD_STATUS_SELECT + """
				WHERE lst.tenant_id = :tenantId
				  AND lower(lst.status_code) = lower(:statusCode)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("statusCode", statusCode.trim())
				.query(SalesConfigJdbcMapper::mapLeadStatus)
				.optional();
	}

	@Override
	public boolean existsLeadStatusByCode(TenantId tenantId, String statusCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.lead_statuses lst
				WHERE lst.tenant_id = :tenantId
				  AND lower(lst.status_code) = lower(:statusCode)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("statusCode", statusCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<LeadStatusDetails> findAllLeadStatuses(TenantId tenantId) {
		String sql = LEAD_STATUS_SELECT + """
				WHERE lst.tenant_id = :tenantId
				ORDER BY lst.display_order ASC, lst.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(SalesConfigJdbcMapper::mapLeadStatusDetails)
				.list();
	}

	@Override
	public void insertLeadStatus(LeadStatus leadStatus) {
		String sql = """
				INSERT INTO crm.lead_statuses (
				    tenant_id, id, status_code, name, status_category,
				    display_order, is_default, is_terminal, is_active,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :statusCode, :name, :statusCategory,
				    :displayOrder, :defaultStatus, :terminal, :active,
				    :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", leadStatus.tenantId().value())
				.param("id", leadStatus.id().value())
				.param("statusCode", leadStatus.statusCode())
				.param("name", leadStatus.name())
				.param("statusCategory", leadStatus.statusCategory().name())
				.param("displayOrder", leadStatus.displayOrder())
				.param("defaultStatus", leadStatus.isDefaultStatus())
				.param("terminal", leadStatus.isTerminal())
				.param("active", leadStatus.isActive())
				.param("createdAt", Timestamp.from(leadStatus.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(leadStatus.auditInfo().updatedAt()))
				.param("createdBy", leadStatus.auditInfo().createdBy() != null ? leadStatus.auditInfo().createdBy().value() : null)
				.param("updatedBy", leadStatus.auditInfo().updatedBy() != null ? leadStatus.auditInfo().updatedBy().value() : null)
				.param("version", leadStatus.version())
				.update();
	}

	@Override
	public void updateLeadStatus(LeadStatus leadStatus) {
		String sql = """
				UPDATE crm.lead_statuses
				SET name = :name,
				    status_category = :statusCategory,
				    display_order = :displayOrder,
				    is_default = :defaultStatus,
				    is_terminal = :terminal,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", leadStatus.tenantId().value())
				.param("id", leadStatus.id().value())
				.param("name", leadStatus.name())
				.param("statusCategory", leadStatus.statusCategory().name())
				.param("displayOrder", leadStatus.displayOrder())
				.param("defaultStatus", leadStatus.isDefaultStatus())
				.param("terminal", leadStatus.isTerminal())
				.param("active", leadStatus.isActive())
				.param("updatedAt", Timestamp.from(leadStatus.auditInfo().updatedAt()))
				.param("updatedBy", leadStatus.auditInfo().updatedBy() != null ? leadStatus.auditInfo().updatedBy().value() : null)
				.param("newVersion", leadStatus.version())
				.param("expectedVersion", leadStatus.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("LeadStatus update failed due to version mismatch");
		}
	}

	@Override
	public Optional<OpportunityLostReason> findLostReasonById(TenantId tenantId, OpportunityLostReasonId id) {
		String sql = LOST_REASON_SELECT + """
				WHERE olr.tenant_id = :tenantId
				  AND olr.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(SalesConfigJdbcMapper::mapLostReason)
				.optional();
	}

	@Override
	public Optional<OpportunityLostReason> findLostReasonByCode(TenantId tenantId, String reasonCode) {
		String sql = LOST_REASON_SELECT + """
				WHERE olr.tenant_id = :tenantId
				  AND lower(olr.reason_code) = lower(:reasonCode)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("reasonCode", reasonCode.trim())
				.query(SalesConfigJdbcMapper::mapLostReason)
				.optional();
	}

	@Override
	public boolean existsLostReasonByCode(TenantId tenantId, String reasonCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.opportunity_lost_reasons olr
				WHERE olr.tenant_id = :tenantId
				  AND lower(olr.reason_code) = lower(:reasonCode)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("reasonCode", reasonCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<OpportunityLostReasonDetails> findAllLostReasons(TenantId tenantId) {
		String sql = LOST_REASON_SELECT + """
				WHERE olr.tenant_id = :tenantId
				ORDER BY olr.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(SalesConfigJdbcMapper::mapLostReasonDetails)
				.list();
	}

	@Override
	public void insertLostReason(OpportunityLostReason reason) {
		String sql = """
				INSERT INTO crm.opportunity_lost_reasons (
				    tenant_id, id, reason_code, name, description,
				    is_active, created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :reasonCode, :name, :description,
				    :active, :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", reason.tenantId().value())
				.param("id", reason.id().value())
				.param("reasonCode", reason.reasonCode())
				.param("name", reason.name())
				.param("description", reason.description())
				.param("active", reason.isActive())
				.param("createdAt", Timestamp.from(reason.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(reason.auditInfo().updatedAt()))
				.param("createdBy", reason.auditInfo().createdBy() != null ? reason.auditInfo().createdBy().value() : null)
				.param("updatedBy", reason.auditInfo().updatedBy() != null ? reason.auditInfo().updatedBy().value() : null)
				.param("version", reason.version())
				.update();
	}

	@Override
	public void updateLostReason(OpportunityLostReason reason) {
		String sql = """
				UPDATE crm.opportunity_lost_reasons
				SET name = :name,
				    description = :description,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", reason.tenantId().value())
				.param("id", reason.id().value())
				.param("name", reason.name())
				.param("description", reason.description())
				.param("active", reason.isActive())
				.param("updatedAt", Timestamp.from(reason.auditInfo().updatedAt()))
				.param("updatedBy", reason.auditInfo().updatedBy() != null ? reason.auditInfo().updatedBy().value() : null)
				.param("newVersion", reason.version())
				.param("expectedVersion", reason.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("OpportunityLostReason update failed due to version mismatch");
		}
	}

}
