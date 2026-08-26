package com.crm.service.category.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.service.category.application.dto.TicketCategorySummary;
import com.crm.service.category.application.port.TicketCategoryRepository;
import com.crm.service.category.domain.TicketCategory;
import com.crm.service.category.domain.TicketCategoryId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTicketCategoryRepository implements TicketCategoryRepository {

	private static final String CATEGORY_SELECT = """
			SELECT tc.tenant_id, tc.id, tc.category_code, tc.name, tc.parent_category_id,
			       tc.default_team_id, tc.description, tc.is_active, tc.created_at,
			       tc.updated_at, tc.created_by, tc.updated_by, tc.version
			FROM service_ticket_categories tc
			""";

	private final JdbcClient jdbcClient;

	public JdbcTicketCategoryRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<TicketCategory> findById(TenantId tenantId, TicketCategoryId id) {
		String sql = CATEGORY_SELECT + """
				WHERE tc.tenant_id = :tenantId
				  AND tc.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(TicketCategoryJdbcMapper::mapCategory)
				.optional();
	}

	@Override
	public Optional<TicketCategory> findByCode(TenantId tenantId, String code) {
		String sql = CATEGORY_SELECT + """
				WHERE tc.tenant_id = :tenantId
				  AND tc.category_code = :code
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(TicketCategoryJdbcMapper::mapCategory)
				.optional();
	}

	@Override
	public boolean existsByCode(TenantId tenantId, String code) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM service_ticket_categories tc
				WHERE tc.tenant_id = :tenantId
				  AND tc.category_code = :code
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<TicketCategorySummary> findAll(TenantId tenantId) {
		String sql = """
				SELECT tc.id, tc.category_code, tc.name, tc.parent_category_id,
				       tc.default_team_id, t.name AS default_team_name,
				       tc.description, tc.is_active, tc.updated_at, tc.version,
				       (SELECT COUNT(*) FROM service_tickets tk WHERE tk.tenant_id = tc.tenant_id AND tk.category_id = tc.id) AS tickets_count
				FROM service_ticket_categories tc
				LEFT JOIN platform_teams t ON t.tenant_id = tc.tenant_id AND t.id = tc.default_team_id
				WHERE tc.tenant_id = :tenantId
				ORDER BY tc.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(TicketCategoryJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public void insert(TicketCategory category) {
		String sql = """
				INSERT INTO service_ticket_categories (
				    tenant_id, id, category_code, name, parent_category_id,
				    default_team_id, description, is_active, created_at,
				    updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :categoryCode, :name, :parentCategoryId,
				    :defaultTeamId, :description, :isActive, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", category.tenantId().value())
				.param("id", category.id().value())
				.param("categoryCode", category.categoryCode())
				.param("name", category.name())
				.param("parentCategoryId", category.parentCategoryId() != null ? category.parentCategoryId().value() : null)
				.param("defaultTeamId", category.defaultTeamId())
				.param("description", category.description())
				.param("isActive", category.isActive())
				.param("createdAt", Timestamp.from(category.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(category.auditInfo().updatedAt()))
				.param("createdBy", category.auditInfo().createdBy() != null ? category.auditInfo().createdBy().value() : null)
				.param("updatedBy", category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null)
				.param("version", category.version())
				.update();
	}

	@Override
	public void update(TicketCategory category) {
		String sql = """
				UPDATE service_ticket_categories
				SET name = :name,
				    parent_category_id = :parentCategoryId,
				    default_team_id = :defaultTeamId,
				    description = :description,
				    is_active = :isActive,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", category.tenantId().value())
				.param("id", category.id().value())
				.param("name", category.name())
				.param("parentCategoryId", category.parentCategoryId() != null ? category.parentCategoryId().value() : null)
				.param("defaultTeamId", category.defaultTeamId())
				.param("description", category.description())
				.param("isActive", category.isActive())
				.param("updatedAt", Timestamp.from(category.auditInfo().updatedAt()))
				.param("updatedBy", category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null)
				.param("newVersion", category.version())
				.param("expectedVersion", category.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("TicketCategory update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, TicketCategoryId id, long version) {
		String sql = """
				DELETE FROM service_ticket_categories
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
			throw new IllegalStateException("TicketCategory delete failed due to version mismatch");
		}
	}

}
