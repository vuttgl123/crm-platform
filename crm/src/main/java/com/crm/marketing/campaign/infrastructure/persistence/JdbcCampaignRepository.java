package com.crm.marketing.campaign.infrastructure.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.lead.domain.LeadId;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.dto.CampaignPerformanceMetrics;
import com.crm.marketing.campaign.application.dto.CampaignSummary;
import com.crm.marketing.campaign.application.port.CampaignRepository;
import com.crm.marketing.campaign.application.query.CampaignSearchQuery;
import com.crm.marketing.campaign.domain.Campaign;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMember;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcCampaignRepository implements CampaignRepository {

	private static final String CAMPAIGN_SELECT = """
			SELECT c.tenant_id, c.id, c.campaign_code, c.name, c.campaign_type,
			       c.status, c.owner_user_id, c.start_at, c.end_at, c.budget,
			       c.actual_cost, c.currency_code, c.expected_revenue, c.description,
			       c.utm_source, c.utm_medium, c.utm_campaign, c.created_at,
			       c.updated_at, c.created_by, c.updated_by, c.deleted_at,
			       c.deleted_by, c.version
			FROM marketing.campaigns c
			""";

	private static final String SUMMARY_SELECT = """
			SELECT c.id, c.campaign_code, c.name, c.campaign_type, c.status,
			       c.owner_user_id, u.email AS owner_user_name,
			       c.start_at, c.end_at, c.budget, c.actual_cost, c.currency_code,
			       c.expected_revenue,
			       (SELECT COUNT(*) FROM marketing.campaign_members m WHERE m.tenant_id = c.tenant_id AND m.campaign_id = c.id) AS members_count,
			       (SELECT COUNT(*) FROM marketing.campaign_members m WHERE m.tenant_id = c.tenant_id AND m.campaign_id = c.id AND m.member_status IN ('RESPONDED', 'ATTENDED')) AS responded_count,
			       (SELECT COALESCE(SUM(o.amount), 0) FROM crm.opportunities o WHERE o.tenant_id = c.tenant_id AND o.campaign_id = c.id AND o.status = 'CLOSED_WON') AS won_revenue,
			       c.updated_at, c.version
			FROM marketing.campaigns c
			LEFT JOIN platform.users u ON u.id = c.owner_user_id
			""";

	private static final String MEMBER_SELECT = """
			SELECT m.id, m.campaign_id, m.lead_id,
			       NULLIF(TRIM(CONCAT(l.first_name, ' ', l.last_name)), '') AS lead_name,
			       l.company AS lead_company,
			       l.email AS lead_email,
			       m.contact_id,
			       NULLIF(TRIM(CONCAT(ct.first_name, ' ', ct.last_name)), '') AS contact_name,
			       ct.email AS contact_email,
			       m.member_status, m.source_detail, m.first_responded_at,
			       m.last_engaged_at, m.metadata, m.created_by, m.created_at,
			       m.updated_by, m.updated_at, m.version
			FROM marketing.campaign_members m
			LEFT JOIN crm.leads l ON l.tenant_id = m.tenant_id AND l.id = m.lead_id
			LEFT JOIN crm.contacts ct ON ct.tenant_id = m.tenant_id AND ct.id = m.contact_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcCampaignRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Campaign> findById(TenantId tenantId, CampaignId id) {
		String sql = CAMPAIGN_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.id = :id
				  AND c.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(CampaignJdbcMapper::mapCampaign)
				.optional();
	}

	@Override
	public Optional<Campaign> findByCode(TenantId tenantId, String code) {
		String sql = CAMPAIGN_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.campaign_code = :code
				  AND c.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(CampaignJdbcMapper::mapCampaign)
				.optional();
	}

	@Override
	public boolean existsByCode(TenantId tenantId, String code) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM marketing.campaigns c
				WHERE c.tenant_id = :tenantId
				  AND c.campaign_code = :code
				  AND c.deleted_at IS NULL
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("code", code)
				.query(Boolean.class)
				.single());
	}

	@Override
	public PageResult<CampaignSummary> search(TenantId tenantId, CampaignSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE c.tenant_id = :tenantId AND c.deleted_at IS NULL ");

		if (query.search() != null && !query.search().isBlank()) {
			params.put("search", "%" + query.search().trim().toLowerCase() + "%");
			whereClause.append(" AND (LOWER(c.campaign_code) LIKE :search OR LOWER(c.name) LIKE :search) ");
		}
		if (query.campaignType() != null) {
			params.put("campaignType", query.campaignType().name());
			whereClause.append(" AND c.campaign_type = :campaignType ");
		}
		if (query.status() != null) {
			params.put("status", query.status().name());
			whereClause.append(" AND c.status = :status ");
		}
		if (query.ownerUserId() != null) {
			params.put("ownerUserId", query.ownerUserId());
			whereClause.append(" AND c.owner_user_id = :ownerUserId ");
		}
		if (query.startDateFrom() != null) {
			params.put("startDateFrom", Timestamp.from(query.startDateFrom()));
			whereClause.append(" AND c.start_at >= :startDateFrom ");
		}
		if (query.startDateTo() != null) {
			params.put("startDateTo", Timestamp.from(query.startDateTo()));
			whereClause.append(" AND c.start_at <= :startDateTo ");
		}

		String countSql = "SELECT COUNT(*) FROM marketing.campaigns c " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
		List<CampaignSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(CampaignJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public CampaignPerformanceMetrics calculateMetrics(TenantId tenantId, CampaignId id) {
		String memberStatsSql = """
				SELECT
				    COUNT(*) AS total_members,
				    COUNT(*) FILTER (WHERE member_status = 'SENT') AS sent_count,
				    COUNT(*) FILTER (WHERE member_status = 'OPENED') AS opened_count,
				    COUNT(*) FILTER (WHERE member_status = 'CLICKED') AS clicked_count,
				    COUNT(*) FILTER (WHERE member_status = 'RESPONDED') AS responded_count,
				    COUNT(*) FILTER (WHERE member_status = 'ATTENDED') AS attended_count
				FROM marketing.campaign_members
				WHERE tenant_id = :tenantId
				  AND campaign_id = :campaignId
				""";

		record MemberStats(int total, int sent, int opened, int clicked, int responded, int attended) {}

		MemberStats stats = jdbcClient.sql(memberStatsSql)
				.param("tenantId", tenantId.value())
				.param("campaignId", id.value())
				.query((rs, rowNum) -> new MemberStats(
						rs.getInt("total_members"),
						rs.getInt("sent_count"),
						rs.getInt("opened_count"),
						rs.getInt("clicked_count"),
						rs.getInt("responded_count"),
						rs.getInt("attended_count")
				))
				.single();

		String oppStatsSql = """
				SELECT
				    COUNT(*) AS opps_count,
				    COUNT(*) FILTER (WHERE status = 'CLOSED_WON') AS won_opps_count,
				    COALESCE(SUM(amount), 0) AS total_opp_value,
				    COALESCE(SUM(amount) FILTER (WHERE status = 'CLOSED_WON'), 0) AS won_opp_value
				FROM crm.opportunities
				WHERE tenant_id = :tenantId
				  AND campaign_id = :campaignId
				  AND deleted_at IS NULL
				""";

		record OppStats(int totalOpps, int wonOpps, BigDecimal totalValue, BigDecimal wonValue) {}

		OppStats oppStats = jdbcClient.sql(oppStatsSql)
				.param("tenantId", tenantId.value())
				.param("campaignId", id.value())
				.query((rs, rowNum) -> new OppStats(
						rs.getInt("opps_count"),
						rs.getInt("won_opps_count"),
						rs.getBigDecimal("total_opp_value"),
						rs.getBigDecimal("won_opp_value")
				))
				.single();

		double responseRate = 0.0;
		int totalEngaged = stats.responded() + stats.attended();
		if (stats.total() > 0) {
			responseRate = Math.round(((double) totalEngaged / stats.total() * 100.0) * 100.0) / 100.0;
		}

		String campaignCostSql = """
				SELECT COALESCE(actual_cost, budget, 0)
				FROM marketing.campaigns
				WHERE tenant_id = :tenantId
				  AND id = :campaignId
				""";
		BigDecimal cost = jdbcClient.sql(campaignCostSql)
				.param("tenantId", tenantId.value())
				.param("campaignId", id.value())
				.query(BigDecimal.class)
				.optional()
				.orElse(BigDecimal.ZERO);

		BigDecimal roi = BigDecimal.ZERO;
		if (cost.compareTo(BigDecimal.ZERO) > 0 && oppStats.wonValue().compareTo(BigDecimal.ZERO) > 0) {
			roi = oppStats.wonValue().subtract(cost)
					.divide(cost, 4, RoundingMode.HALF_UP)
					.multiply(BigDecimal.valueOf(100))
					.setScale(2, RoundingMode.HALF_UP);
		}

		return new CampaignPerformanceMetrics(
				stats.total(),
				stats.sent(),
				stats.opened(),
				stats.clicked(),
				stats.responded(),
				stats.attended(),
				responseRate,
				oppStats.totalOpps(),
				oppStats.wonOpps(),
				oppStats.totalValue(),
				oppStats.wonValue(),
				roi
		);
	}

	@Override
	public PageResult<CampaignMemberDetails> findMembers(TenantId tenantId, CampaignId campaignId, PageQuery page) {
		String countSql = """
				SELECT COUNT(*)
				FROM marketing.campaign_members m
				WHERE m.tenant_id = :tenantId
				  AND m.campaign_id = :campaignId
				""";
		Long totalElements = jdbcClient.sql(countSql)
				.param("tenantId", tenantId.value())
				.param("campaignId", campaignId.value())
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		String dataSql = MEMBER_SELECT + """
				WHERE m.tenant_id = :tenantId
				  AND m.campaign_id = :campaignId
				ORDER BY m.created_at DESC
				LIMIT :limit OFFSET :offset
				""";
		List<CampaignMemberDetails> content = jdbcClient.sql(dataSql)
				.param("tenantId", tenantId.value())
				.param("campaignId", campaignId.value())
				.param("limit", page.size())
				.param("offset", page.offset())
				.query(CampaignJdbcMapper::mapMemberDetails)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public Optional<CampaignMember> findMemberById(TenantId tenantId, CampaignMemberId memberId) {
		String sql = """
				SELECT m.tenant_id, m.id, m.campaign_id, m.lead_id, m.contact_id,
				       m.member_status, m.source_detail, m.first_responded_at,
				       m.last_engaged_at, m.metadata, m.created_at, m.updated_at,
				       m.created_by, m.updated_by, m.version
				FROM marketing.campaign_members m
				WHERE m.tenant_id = :tenantId
				  AND m.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", memberId.value())
				.query(CampaignJdbcMapper::mapMember)
				.optional();
	}

	@Override
	public boolean existsMemberByLead(TenantId tenantId, CampaignId campaignId, LeadId leadId) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM marketing.campaign_members m
				WHERE m.tenant_id = :tenantId
				  AND m.campaign_id = :campaignId
				  AND m.lead_id = :leadId
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("campaignId", campaignId.value())
				.param("leadId", leadId.value())
				.query(Boolean.class)
				.single());
	}

	@Override
	public boolean existsMemberByContact(TenantId tenantId, CampaignId campaignId, ContactId contactId) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM marketing.campaign_members m
				WHERE m.tenant_id = :tenantId
				  AND m.campaign_id = :campaignId
				  AND m.contact_id = :contactId
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("campaignId", campaignId.value())
				.param("contactId", contactId.value())
				.query(Boolean.class)
				.single());
	}

	@Override
	public void insert(Campaign campaign) {
		String sql = """
				INSERT INTO marketing.campaigns (
				    tenant_id, id, campaign_code, name, campaign_type,
				    status, owner_user_id, start_at, end_at, budget,
				    actual_cost, currency_code, expected_revenue, description,
				    utm_source, utm_medium, utm_campaign, created_at,
				    updated_at, created_by, updated_by, deleted_at, deleted_by, version
				) VALUES (
				    :tenantId, :id, :campaignCode, :name, :campaignType,
				    :status, :ownerUserId, :startAt, :endAt, :budget,
				    :actualCost, :currencyCode, :expectedRevenue, :description,
				    :utmSource, :utmMedium, :utmCampaign, :createdAt,
				    :updatedAt, :createdBy, :updatedBy, :deletedAt, :deletedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", campaign.tenantId().value())
				.param("id", campaign.id().value())
				.param("campaignCode", campaign.campaignCode())
				.param("name", campaign.name())
				.param("campaignType", campaign.campaignType().name())
				.param("status", campaign.status().name())
				.param("ownerUserId", campaign.ownerUserId() != null ? campaign.ownerUserId().value() : null)
				.param("startAt", campaign.startAt() != null ? Timestamp.from(campaign.startAt()) : null)
				.param("endAt", campaign.endAt() != null ? Timestamp.from(campaign.endAt()) : null)
				.param("budget", campaign.budget())
				.param("actualCost", campaign.actualCost())
				.param("currencyCode", campaign.currencyCode())
				.param("expectedRevenue", campaign.expectedRevenue())
				.param("description", campaign.description())
				.param("utmSource", campaign.utmSource())
				.param("utmMedium", campaign.utmMedium())
				.param("utmCampaign", campaign.utmCampaign())
				.param("createdAt", Timestamp.from(campaign.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(campaign.auditInfo().updatedAt()))
				.param("createdBy", campaign.auditInfo().createdBy() != null ? campaign.auditInfo().createdBy().value() : null)
				.param("updatedBy", campaign.auditInfo().updatedBy() != null ? campaign.auditInfo().updatedBy().value() : null)
				.param("deletedAt", campaign.deletedAt() != null ? Timestamp.from(campaign.deletedAt()) : null)
				.param("deletedBy", campaign.deletedBy() != null ? campaign.deletedBy().value() : null)
				.param("version", campaign.version())
				.update();
	}

	@Override
	public void update(Campaign campaign) {
		String sql = """
				UPDATE marketing.campaigns
				SET name = :name,
				    campaign_type = :campaignType,
				    status = :status,
				    owner_user_id = :ownerUserId,
				    start_at = :startAt,
				    end_at = :endAt,
				    budget = :budget,
				    actual_cost = :actualCost,
				    currency_code = :currencyCode,
				    expected_revenue = :expectedRevenue,
				    description = :description,
				    utm_source = :utmSource,
				    utm_medium = :utmMedium,
				    utm_campaign = :utmCampaign,
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
				.param("tenantId", campaign.tenantId().value())
				.param("id", campaign.id().value())
				.param("name", campaign.name())
				.param("campaignType", campaign.campaignType().name())
				.param("status", campaign.status().name())
				.param("ownerUserId", campaign.ownerUserId() != null ? campaign.ownerUserId().value() : null)
				.param("startAt", campaign.startAt() != null ? Timestamp.from(campaign.startAt()) : null)
				.param("endAt", campaign.endAt() != null ? Timestamp.from(campaign.endAt()) : null)
				.param("budget", campaign.budget())
				.param("actualCost", campaign.actualCost())
				.param("currencyCode", campaign.currencyCode())
				.param("expectedRevenue", campaign.expectedRevenue())
				.param("description", campaign.description())
				.param("utmSource", campaign.utmSource())
				.param("utmMedium", campaign.utmMedium())
				.param("utmCampaign", campaign.utmCampaign())
				.param("updatedAt", Timestamp.from(campaign.auditInfo().updatedAt()))
				.param("updatedBy", campaign.auditInfo().updatedBy() != null ? campaign.auditInfo().updatedBy().value() : null)
				.param("deletedAt", campaign.deletedAt() != null ? Timestamp.from(campaign.deletedAt()) : null)
				.param("deletedBy", campaign.deletedBy() != null ? campaign.deletedBy().value() : null)
				.param("newVersion", campaign.version())
				.param("expectedVersion", campaign.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Campaign update failed due to version mismatch");
		}
	}

	@Override
	public void insertMember(CampaignMember member) {
		String sql = """
				INSERT INTO marketing.campaign_members (
				    tenant_id, id, campaign_id, lead_id, contact_id,
				    member_status, source_detail, first_responded_at,
				    last_engaged_at, metadata, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :campaignId, :leadId, :contactId,
				    :memberStatus, :sourceDetail, :firstRespondedAt,
				    :lastEngagedAt, CAST(:metadata AS jsonb), :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", member.tenantId().value())
				.param("id", member.id().value())
				.param("campaignId", member.campaignId().value())
				.param("leadId", member.leadId() != null ? member.leadId().value() : null)
				.param("contactId", member.contactId() != null ? member.contactId().value() : null)
				.param("memberStatus", member.memberStatus().name())
				.param("sourceDetail", member.sourceDetail())
				.param("firstRespondedAt", member.firstRespondedAt() != null ? Timestamp.from(member.firstRespondedAt()) : null)
				.param("lastEngagedAt", member.lastEngagedAt() != null ? Timestamp.from(member.lastEngagedAt()) : null)
				.param("metadata", member.metadata())
				.param("createdAt", Timestamp.from(member.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(member.auditInfo().updatedAt()))
				.param("createdBy", member.auditInfo().createdBy() != null ? member.auditInfo().createdBy().value() : null)
				.param("updatedBy", member.auditInfo().updatedBy() != null ? member.auditInfo().updatedBy().value() : null)
				.param("version", member.version())
				.update();
	}

	@Override
	public void updateMember(CampaignMember member) {
		String sql = """
				UPDATE marketing.campaign_members
				SET member_status = :memberStatus,
				    source_detail = :sourceDetail,
				    first_responded_at = :firstRespondedAt,
				    last_engaged_at = :lastEngagedAt,
				    metadata = CAST(:metadata AS jsonb),
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", member.tenantId().value())
				.param("id", member.id().value())
				.param("memberStatus", member.memberStatus().name())
				.param("sourceDetail", member.sourceDetail())
				.param("firstRespondedAt", member.firstRespondedAt() != null ? Timestamp.from(member.firstRespondedAt()) : null)
				.param("lastEngagedAt", member.lastEngagedAt() != null ? Timestamp.from(member.lastEngagedAt()) : null)
				.param("metadata", member.metadata())
				.param("updatedAt", Timestamp.from(member.auditInfo().updatedAt()))
				.param("updatedBy", member.auditInfo().updatedBy() != null ? member.auditInfo().updatedBy().value() : null)
				.param("newVersion", member.version())
				.param("expectedVersion", member.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("CampaignMember update failed due to version mismatch");
		}
	}

	@Override
	public void deleteMember(TenantId tenantId, CampaignMemberId memberId) {
		String sql = """
				DELETE FROM marketing.campaign_members
				WHERE tenant_id = :tenantId
				  AND id = :id
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", memberId.value())
				.update();
	}

}
