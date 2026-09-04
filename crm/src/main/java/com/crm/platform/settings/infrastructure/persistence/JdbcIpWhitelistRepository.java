package com.crm.platform.settings.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.settings.application.port.IpWhitelistRepository;
import com.crm.platform.settings.domain.IpWhitelistRule;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcIpWhitelistRepository implements IpWhitelistRepository {

	private final JdbcClient jdbcClient;

	public JdbcIpWhitelistRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public List<IpWhitelistRule> findAll(TenantId tenantId) {
		return jdbcClient.sql("""
				SELECT tenant_id, id, cidr_block, description, is_active,
				       created_at, created_by
				FROM platform_ip_whitelist
				WHERE tenant_id = :tenantId
				ORDER BY created_at DESC
				""")
				.param("tenantId", tenantId.value().toString())
				.query(this::mapRow)
				.list();
	}

	@Override
	public Optional<IpWhitelistRule> findById(TenantId tenantId, UUID id) {
		return jdbcClient.sql("""
				SELECT tenant_id, id, cidr_block, description, is_active,
				       created_at, created_by
				FROM platform_ip_whitelist
				WHERE tenant_id = :tenantId AND id = :id
				""")
				.param("tenantId", tenantId.value().toString())
				.param("id", id.toString())
				.query(this::mapRow)
				.optional();
	}

	@Override
	public void insert(IpWhitelistRule rule) {
		jdbcClient.sql("""
				INSERT INTO platform_ip_whitelist (
				    tenant_id, id, cidr_block, description, is_active,
				    created_at, created_by
				) VALUES (
				    :tenantId, :id, :cidrBlock, :description, :isActive,
				    :createdAt, :createdBy
				)
				""")
				.param("tenantId", rule.tenantId().value().toString())
				.param("id", rule.id().toString())
				.param("cidrBlock", rule.cidrBlock())
				.param("description", rule.description())
				.param("isActive", rule.isActive())
				.param("createdAt", Timestamp.from(rule.createdAt()))
				.param("createdBy", rule.createdBy() != null ? rule.createdBy().value().toString() : null)
				.update();
	}

	@Override
	public void delete(TenantId tenantId, UUID id) {
		jdbcClient.sql("""
				DELETE FROM platform_ip_whitelist
				WHERE tenant_id = :tenantId AND id = :id
				""")
				.param("tenantId", tenantId.value().toString())
				.param("id", id.toString())
				.update();
	}

	private IpWhitelistRule mapRow(ResultSet rs, int rowNum) throws SQLException {
		String createdByStr = rs.getString("created_by");
		ActorId createdBy = createdByStr != null ? new ActorId(UUID.fromString(createdByStr)) : null;

		return new IpWhitelistRule(
				new TenantId(UUID.fromString(rs.getString("tenant_id"))),
				UUID.fromString(rs.getString("id")),
				rs.getString("cidr_block"),
				rs.getString("description"),
				rs.getBoolean("is_active"),
				rs.getTimestamp("created_at").toInstant(),
				createdBy
		);
	}
}
