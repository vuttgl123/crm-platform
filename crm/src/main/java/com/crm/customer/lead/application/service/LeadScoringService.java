package com.crm.customer.lead.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.dto.LeadScoringResult;
import com.crm.customer.lead.application.port.LeadRepository;
import com.crm.customer.lead.domain.Lead;
import com.crm.customer.lead.domain.LeadErrorCode;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LeadScoringService {

	private static final String ENTITY_TYPE = "lead";

	private final LeadRepository leadRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final TimeProvider timeProvider;
	private final JdbcClient jdbcClient;

	public LeadScoringService(
			LeadRepository leadRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			TimeProvider timeProvider,
			JdbcClient jdbcClient) {
		this.leadRepository = leadRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.timeProvider = timeProvider;
		this.jdbcClient = jdbcClient;
	}

	@Transactional(readOnly = true)
	public LeadScoringResult calculateScore(LeadId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.CRM_LEAD_READ, ENTITY_TYPE);

		Lead lead = leadRepository.findById(tenantId, id, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(LeadErrorCode.LEAD_NOT_FOUND));

		int score = 0;
		List<String> factors = new ArrayList<>();

		// 1. Company information
		if (lead.companyName() != null && !lead.companyName().isBlank()) {
			score += 25;
			factors.add("+25 điểm: Có tên pháp nhân / doanh nghiệp rõ ràng (" + lead.companyName() + ")");
		}

		// 2. Budget / Revenue
		if (lead.estimatedRevenue() != null && lead.estimatedRevenue().amount() != null) {
			long amt = lead.estimatedRevenue().amount().longValue();
			if (amt >= 1_000_000_000L) {
				score += 30;
				factors.add("+30 điểm: Ngân sách dự kiến cao (>= 1 tỷ VNĐ)");
			} else if (amt >= 200_000_000L) {
				score += 15;
				factors.add("+15 điểm: Ngân sách tiềm năng (>= 200 triệu VNĐ)");
			}
		}

		// 3. Contact information completeness
		boolean hasEmail = lead.email() != null && !lead.email().isBlank();
		boolean hasPhone = lead.phone() != null && !lead.phone().isBlank();
		if (hasEmail && hasPhone) {
			score += 20;
			factors.add("+20 điểm: Đầy đủ cả kênh liên lạc Email và Số điện thoại");
		} else if (hasEmail || hasPhone) {
			score += 10;
			factors.add("+10 điểm: Có ít nhất một kênh liên lạc trực tiếp");
		}

		// 4. Job title authority
		if (lead.jobTitle() != null && !lead.jobTitle().isBlank()) {
			String title = lead.jobTitle().toLowerCase();
			if (title.contains("giám đốc") || title.contains("director") || title.contains("ceo") || title.contains("cto") || title.contains("trưởng phòng")) {
				score += 25;
				factors.add("+25 điểm: Người liên hệ có thẩm quyền ra quyết định (" + lead.jobTitle() + ")");
			} else {
				score += 10;
				factors.add("+10 điểm: Có chức danh người liên hệ");
			}
		}

		// Cap score between 0 and 100
		score = Math.min(100, Math.max(0, score));

		String grade;
		String recommendedAction;
		if (score >= 70) {
			grade = "HOT";
			recommendedAction = "Chuyển gấp cho Trưởng nhóm Sales gọi tư vấn trực tiếp trong vòng 2 giờ.";
		} else if (score >= 40) {
			grade = "WARM";
			recommendedAction = "Lên lịch demo sản phẩm và gửi tài liệu giải pháp qua Email.";
		} else {
			grade = "COLD";
			recommendedAction = "Thêm vào danh sách nuôi dưỡng (Nurturing Email Campaign) tự động.";
		}

		return new LeadScoringResult(id.toString(), score, grade, factors, recommendedAction);
	}

	@Transactional
	public LeadDetails autoAssign(LeadId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.CRM_LEAD_WRITE, ENTITY_TYPE);

		Lead lead = leadRepository.findById(tenantId, id, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(LeadErrorCode.LEAD_NOT_FOUND));

		// Round-robin user lookup from active tenant members
		String nextUserId = jdbcClient.sql("""
				SELECT user_id FROM tenant_memberships
				WHERE tenant_id = :tenantId AND status = 'ACTIVE'
				ORDER BY updated_at ASC LIMIT 1
				""")
				.param("tenantId", tenantId.toString())
				.query(String.class)
				.optional()
				.orElse(actorId.toString());

		LeadOwner newOwner = new LeadOwner(AccountOwnerType.USER, UUID.fromString(nextUserId));
		lead.reassign(newOwner, actorId, timeProvider.now());
		leadRepository.save(lead);

		return toDetails(lead);
	}

	private LeadDetails toDetails(Lead lead) {
		return new LeadDetails(
				lead.tenantId(),
				lead.id(),
				lead.leadNumber(),
				lead.statusId(),
				lead.sourceId(),
				lead.owner(),
				lead.rating(),
				lead.accountName(),
				lead.companyName(),
				lead.honorific(),
				lead.givenName(),
				lead.familyName(),
				lead.displayName(),
				lead.email(),
				lead.phoneE164(),
				lead.jobTitle(),
				lead.website(),
				lead.countryCode(),
				lead.preferredLanguageCode(),
				lead.estimatedValue(),
				lead.qualificationNotes(),
				lead.disqualificationReason(),
				lead.convertedAt(),
				lead.convertedBy(),
				lead.convertedAccountId(),
				lead.convertedContactId(),
				lead.convertedOpportunityId(),
				lead.createdAt(),
				lead.createdBy(),
				lead.updatedAt(),
				lead.updatedBy(),
				lead.version());
	}

}
