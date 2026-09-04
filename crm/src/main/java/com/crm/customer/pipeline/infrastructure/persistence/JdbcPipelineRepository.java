package com.crm.customer.pipeline.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.application.port.PipelineRepository;
import com.crm.customer.pipeline.domain.Pipeline;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStage;
import com.crm.customer.pipeline.domain.PipelineStageId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPipelineRepository implements PipelineRepository {

	private static final String PIPELINE_SELECT = """
			SELECT p.tenant_id, p.id, p.pipeline_code, p.name, p.pipeline_type,
			       p.is_default, p.is_active, p.created_at, p.updated_at,
			       p.created_by, p.updated_by, p.version
			FROM crm.pipelines p
			""";

	private static final String SUMMARY_SELECT = """
			SELECT p.id, p.pipeline_code, p.name, p.pipeline_type,
			       p.is_default, p.is_active, p.created_at, p.updated_at, p.version,
			       COALESCE((SELECT COUNT(*) FROM crm.pipeline_stages ps WHERE ps.tenant_id = p.tenant_id AND ps.pipeline_id = p.id), 0) AS stage_count
			FROM crm.pipelines p
			""";

	private static final String STAGE_SELECT = """
			SELECT ps.tenant_id, ps.id, ps.pipeline_id, ps.stage_code, ps.name,
			       ps.display_order, ps.default_probability, ps.stage_category,
			       ps.forecast_category, ps.is_active, ps.created_at, ps.updated_at,
			       ps.created_by, ps.updated_by, ps.version
			FROM crm.pipeline_stages ps
			""";

	private final JdbcClient jdbcClient;

	public JdbcPipelineRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Pipeline> findById(TenantId tenantId, PipelineId id) {
		String sql = PIPELINE_SELECT + """
				WHERE p.tenant_id = :tenantId
				  AND p.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(PipelineJdbcMapper::mapPipeline)
				.optional();
	}

	@Override
	public Optional<Pipeline> findByCode(TenantId tenantId, String pipelineCode) {
		String sql = PIPELINE_SELECT + """
				WHERE p.tenant_id = :tenantId
				  AND lower(p.pipeline_code) = lower(:pipelineCode)
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineCode", pipelineCode.trim())
				.query(PipelineJdbcMapper::mapPipeline)
				.optional();
	}

	@Override
	public boolean existsByCode(TenantId tenantId, String pipelineCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.pipelines p
				WHERE p.tenant_id = :tenantId
				  AND lower(p.pipeline_code) = lower(:pipelineCode)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineCode", pipelineCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<PipelineSummary> findAll(TenantId tenantId) {
		String sql = SUMMARY_SELECT + """
				WHERE p.tenant_id = :tenantId
				ORDER BY p.pipeline_type ASC, p.is_default DESC, p.pipeline_code ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(PipelineJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public void insert(Pipeline pipeline) {
		String sql = """
				INSERT INTO crm.pipelines (
				    tenant_id, id, pipeline_code, name, pipeline_type,
				    is_default, is_active, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :pipelineCode, :name, :pipelineType,
				    :defaultPipeline, :active, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", pipeline.tenantId().value())
				.param("id", pipeline.id().value())
				.param("pipelineCode", pipeline.pipelineCode())
				.param("name", pipeline.name())
				.param("pipelineType", pipeline.pipelineType().name())
				.param("defaultPipeline", pipeline.isDefaultPipeline())
				.param("active", pipeline.isActive())
				.param("createdAt", Timestamp.from(pipeline.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(pipeline.auditInfo().updatedAt()))
				.param("createdBy", pipeline.auditInfo().createdBy() != null ? pipeline.auditInfo().createdBy().value() : null)
				.param("updatedBy", pipeline.auditInfo().updatedBy() != null ? pipeline.auditInfo().updatedBy().value() : null)
				.param("version", pipeline.version())
				.update();
	}

	@Override
	public void update(Pipeline pipeline) {
		String sql = """
				UPDATE crm.pipelines
				SET name = :name,
				    pipeline_type = :pipelineType,
				    is_default = :defaultPipeline,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", pipeline.tenantId().value())
				.param("id", pipeline.id().value())
				.param("name", pipeline.name())
				.param("pipelineType", pipeline.pipelineType().name())
				.param("defaultPipeline", pipeline.isDefaultPipeline())
				.param("active", pipeline.isActive())
				.param("updatedAt", Timestamp.from(pipeline.auditInfo().updatedAt()))
				.param("updatedBy", pipeline.auditInfo().updatedBy() != null ? pipeline.auditInfo().updatedBy().value() : null)
				.param("newVersion", pipeline.version())
				.param("expectedVersion", pipeline.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Pipeline update failed due to version mismatch");
		}
	}

	@Override
	public List<PipelineStageDetails> findStagesByPipeline(TenantId tenantId, PipelineId pipelineId) {
		String sql = STAGE_SELECT + """
				WHERE ps.tenant_id = :tenantId
				  AND ps.pipeline_id = :pipelineId
				ORDER BY ps.display_order ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineId", pipelineId.value())
				.query(PipelineJdbcMapper::mapStageDetails)
				.list();
	}

	@Override
	public Optional<PipelineStage> findStageById(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId) {
		String sql = STAGE_SELECT + """
				WHERE ps.tenant_id = :tenantId
				  AND ps.pipeline_id = :pipelineId
				  AND ps.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineId", pipelineId.value())
				.param("id", stageId.value())
				.query(PipelineJdbcMapper::mapStage)
				.optional();
	}

	@Override
	public boolean existsStageByCode(TenantId tenantId, PipelineId pipelineId, String stageCode) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM crm.pipeline_stages ps
				WHERE ps.tenant_id = :tenantId
				  AND ps.pipeline_id = :pipelineId
				  AND lower(ps.stage_code) = lower(:stageCode)
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineId", pipelineId.value())
				.param("stageCode", stageCode.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public void insertStage(PipelineStage stage) {
		String sql = """
				INSERT INTO crm.pipeline_stages (
				    tenant_id, id, pipeline_id, stage_code, name,
				    display_order, default_probability, stage_category, forecast_category,
				    is_active, created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :pipelineId, :stageCode, :name,
				    :displayOrder, :defaultProbability, :stageCategory, :forecastCategory,
				    :active, :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", stage.tenantId().value())
				.param("id", stage.id().value())
				.param("pipelineId", stage.pipelineId().value())
				.param("stageCode", stage.stageCode())
				.param("name", stage.name())
				.param("displayOrder", stage.displayOrder())
				.param("defaultProbability", stage.defaultProbability())
				.param("stageCategory", stage.stageCategory().name())
				.param("forecastCategory", stage.forecastCategory().name())
				.param("active", stage.isActive())
				.param("createdAt", Timestamp.from(stage.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(stage.auditInfo().updatedAt()))
				.param("createdBy", stage.auditInfo().createdBy() != null ? stage.auditInfo().createdBy().value() : null)
				.param("updatedBy", stage.auditInfo().updatedBy() != null ? stage.auditInfo().updatedBy().value() : null)
				.param("version", stage.version())
				.update();
	}

	@Override
	public void updateStage(PipelineStage stage) {
		String sql = """
				UPDATE crm.pipeline_stages
				SET name = :name,
				    display_order = :displayOrder,
				    default_probability = :defaultProbability,
				    stage_category = :stageCategory,
				    forecast_category = :forecastCategory,
				    is_active = :active,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND pipeline_id = :pipelineId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", stage.tenantId().value())
				.param("pipelineId", stage.pipelineId().value())
				.param("id", stage.id().value())
				.param("name", stage.name())
				.param("displayOrder", stage.displayOrder())
				.param("defaultProbability", stage.defaultProbability())
				.param("stageCategory", stage.stageCategory().name())
				.param("forecastCategory", stage.forecastCategory().name())
				.param("active", stage.isActive())
				.param("updatedAt", Timestamp.from(stage.auditInfo().updatedAt()))
				.param("updatedBy", stage.auditInfo().updatedBy() != null ? stage.auditInfo().updatedBy().value() : null)
				.param("newVersion", stage.version())
				.param("expectedVersion", stage.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("PipelineStage update failed due to version mismatch");
		}
	}

	@Override
	public void deleteStage(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId) {
		String sql = """
				DELETE FROM crm.pipeline_stages
				WHERE tenant_id = :tenantId
				  AND pipeline_id = :pipelineId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("pipelineId", pipelineId.value())
				.param("id", stageId.value())
				.update();
	}

	@Override
	public Optional<Pipeline> findDefault(TenantId tenantId) {
		String sql = PIPELINE_SELECT + """
				WHERE p.tenant_id = :tenantId
				  AND p.is_default = true
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(PipelineJdbcMapper::mapPipeline)
				.optional();
	}

	@Override
	public void deletePipeline(TenantId tenantId, PipelineId id, java.time.Instant now) {
		jdbcClient.sql("""
				DELETE FROM crm.pipeline_stages
				WHERE tenant_id = :tenantId AND pipeline_id = :id
				""")
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();

		jdbcClient.sql("""
				DELETE FROM crm.pipelines
				WHERE tenant_id = :tenantId AND id = :id
				""")
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.update();
	}

	@Override
	public void updateStageDisplayOrder(TenantId tenantId, PipelineId pipelineId, PipelineStageId stageId, int displayOrder, java.time.Instant now) {
		jdbcClient.sql("""
				UPDATE crm.pipeline_stages
				SET display_order = :displayOrder,
				    updated_at = :now,
				    version = version + 1
				WHERE tenant_id = :tenantId
				  AND pipeline_id = :pipelineId
				  AND id = :id
				""")
				.param("displayOrder", displayOrder)
				.param("now", Timestamp.from(now))
				.param("tenantId", tenantId.value())
				.param("pipelineId", pipelineId.value())
				.param("id", stageId.value())
				.update();
	}

}
