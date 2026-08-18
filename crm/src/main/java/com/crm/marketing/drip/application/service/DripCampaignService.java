package com.crm.marketing.drip.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.marketing.drip.application.dto.CreateDripCampaignRequest;
import com.crm.marketing.drip.application.dto.DripCampaignAnalyticsResponse;
import com.crm.marketing.drip.application.dto.DripCampaignSummary;
import com.crm.marketing.drip.application.dto.DripStepAnalytics;
import com.crm.marketing.drip.application.dto.DripStepDto;
import com.crm.marketing.drip.application.dto.EnrollSubscriberRequest;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class DripCampaignService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	// In-memory store for drip campaigns with tenant scoping
	private final ConcurrentHashMap<String, List<DripCampaignSummary>> campaignsStore = new ConcurrentHashMap<>();

	public DripCampaignService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public DripCampaignSummary createCampaign(CreateDripCampaignRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		UUID id = UUID.randomUUID();
		List<DripStepDto> steps = request.steps() != null && !request.steps().isEmpty()
				? request.steps()
				: generateDefaultSteps();

		DripCampaignSummary summary = new DripCampaignSummary(
				id,
				request.name(),
				request.description(),
				request.triggerEvent() != null ? request.triggerEvent() : "LEAD_CREATED",
				request.targetAudience() != null ? request.targetAudience() : "ALL_LEADS",
				"ACTIVE",
				1,
				1,
				0,
				steps.size(),
				steps,
				"2026-08-18 10:00:00"
		);

		campaignsStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>(seedDefaultDripCampaigns())).add(0, summary);
		return summary;
	}

	public List<DripCampaignSummary> listCampaigns() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		List<DripCampaignSummary> list = campaignsStore.get(tenantId.value().toString());
		if (list == null || list.isEmpty()) {
			List<DripCampaignSummary> defaults = seedDefaultDripCampaigns();
			campaignsStore.put(tenantId.value().toString(), defaults);
			return defaults;
		}

		return list;
	}

	public DripCampaignSummary getCampaign(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		return listCampaigns().stream()
				.filter(c -> c.id().equals(id))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kịch bản nuôi dưỡng với ID: " + id));
	}

	public DripCampaignSummary updateStatus(UUID id, String status) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		List<DripCampaignSummary> list = campaignsStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>(seedDefaultDripCampaigns()));
		for (int i = 0; i < list.size(); i++) {
			if (list.get(i).id().equals(id)) {
				DripCampaignSummary old = list.get(i);
				DripCampaignSummary updated = new DripCampaignSummary(
						old.id(),
						old.name(),
						old.description(),
						old.triggerEvent(),
						old.targetAudience(),
						status != null ? status.toUpperCase() : "ACTIVE",
						old.totalEnrolled(),
						old.activeSubscribers(),
						old.completedSubscribers(),
						old.stepCount(),
						old.steps(),
						old.createdAt()
				);
				list.set(i, updated);
				return updated;
			}
		}

		throw new IllegalArgumentException("Không tìm thấy kịch bản nuôi dưỡng để cập nhật trạng thái: " + id);
	}

	public void deleteCampaign(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		List<DripCampaignSummary> list = campaignsStore.get(tenantId.value().toString());
		if (list != null) {
			list.removeIf(c -> c.id().equals(id));
		}
	}

	public boolean enrollSubscriber(UUID campaignId, EnrollSubscriberRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		List<DripCampaignSummary> list = campaignsStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>(seedDefaultDripCampaigns()));
		for (int i = 0; i < list.size(); i++) {
			if (list.get(i).id().equals(campaignId)) {
				DripCampaignSummary old = list.get(i);
				DripCampaignSummary updated = new DripCampaignSummary(
						old.id(),
						old.name(),
						old.description(),
						old.triggerEvent(),
						old.targetAudience(),
						old.status(),
						old.totalEnrolled() + 1,
						old.activeSubscribers() + 1,
						old.completedSubscribers(),
						old.stepCount(),
						old.steps(),
						old.createdAt()
				);
				list.set(i, updated);
				return true;
			}
		}
		return true;
	}

	public DripCampaignAnalyticsResponse getCampaignAnalytics(UUID campaignId) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		DripCampaignSummary campaign = getCampaign(campaignId);

		List<DripStepAnalytics> stepAnalytics = new ArrayList<>();
		if (campaign.steps() != null && !campaign.steps().isEmpty()) {
			int currentPool = Math.max(campaign.totalEnrolled(), 100);
			for (DripStepDto step : campaign.steps()) {
				int sent = currentPool;
				int opened = (int) Math.round(sent * 0.85);
				int clicked = (int) Math.round(opened * 0.60);
				double openRate = sent > 0 ? (opened * 100.0 / sent) : 0.0;
				double clickRate = opened > 0 ? (clicked * 100.0 / opened) : 0.0;
				double convRate = sent > 0 ? (clicked * 100.0 / sent) : 0.0;

				stepAnalytics.add(new DripStepAnalytics(
						step.stepOrder(),
						step.name(),
						step.stepType(),
						sent,
						opened,
						clicked,
						Math.round(openRate * 10.0) / 10.0,
						Math.round(clickRate * 10.0) / 10.0,
						Math.round(convRate * 10.0) / 10.0
				));
				currentPool = (int) Math.round(currentPool * 0.80);
			}
		} else {
			stepAnalytics = List.of(
					new DripStepAnalytics(1, "Email Chào mừng & Hồ sơ Năng lực", "EMAIL", 128, 112, 68, 87.5, 60.7, 53.1),
					new DripStepAnalytics(2, "SMS Nhắc nhở Đăng ký Trải nghiệm Demo", "SMS", 112, 108, 54, 96.4, 50.0, 48.2),
					new DripStepAnalytics(3, "Email Chia sẻ Case Study Doanh nghiệp", "EMAIL", 95, 78, 46, 82.1, 59.0, 48.4),
					new DripStepAnalytics(4, "Tự động Tạo Nhiệm vụ Gọi Tư vấn Báo giá", "CREATE_TASK", 65, 65, 42, 100.0, 64.6, 64.6)
			);
		}

		double overallConversion = stepAnalytics.isEmpty() ? 32.8 : stepAnalytics.get(stepAnalytics.size() - 1).conversionRatePercent();

		return new DripCampaignAnalyticsResponse(
				campaignId,
				campaign.name(),
				campaign.totalEnrolled(),
				overallConversion,
				stepAnalytics
		);
	}

	private List<DripStepDto> generateDefaultSteps() {
		return List.of(
				new DripStepDto(1, "EMAIL", "Email Chào mừng & Giới thiệu Năng lực", 0, "Chào mừng đến với CRM", "Kính chào quý khách...", "ALL"),
				new DripStepDto(2, "SMS", "SMS Mời Trải nghiệm Bản Demo Trực tuyến", 2, null, "CRM: Mời bạn dùng thử giải pháp...", "ALL"),
				new DripStepDto(3, "EMAIL", "Email Chia sẻ Tài liệu Chuyển đổi số & Báo giá", 4, "Tài liệu chuyên sâu ngành CRM", "Gửi anh/chị tài liệu...", "ALL"),
				new DripStepDto(4, "CREATE_TASK", "Tự động Giao Việc Gọi Tư vấn cho Chuyên viên Sales", 6, null, "Tạo task gọi chốt deal", "SALES_TEAM")
		);
	}

	private List<DripCampaignSummary> seedDefaultDripCampaigns() {
		List<DripCampaignSummary> defaults = new ArrayList<>();
		defaults.add(new DripCampaignSummary(
				UUID.fromString("77000000-0000-0000-0000-000000000001"),
				"Chuỗi Nuôi dưỡng Khách hàng Tiềm năng Mới (New Lead Welcome Sequence)",
				"Tự động gửi email giới thiệu hệ sinh thái, sau 2 ngày gửi SMS Demo và tạo lịch gọi tư vấn.",
				"LEAD_CREATED",
				"ALL_LEADS",
				"ACTIVE",
				128,
				42,
				86,
				4,
				List.of(
						new DripStepDto(1, "EMAIL", "Email Chào mừng & Hồ sơ Năng lực Doanh nghiệp", 0, "Chào mừng quý khách đến với CRM", "Kính gửi quý khách...", "ALL"),
						new DripStepDto(2, "SMS", "SMS Nhắc nhở Đăng ký Trải nghiệm Demo Trực tuyến", 2, null, "CRM: Mời bạn dùng thử giải pháp...", "ALL"),
						new DripStepDto(3, "EMAIL", "Email Chia sẻ Case Study Doanh nghiệp Cùng Ngành", 4, "Case study doanh nghiệp tối ưu 35% chi phí", "Gửi anh/chị case study...", "ALL"),
						new DripStepDto(4, "CREATE_TASK", "Tự động Phân công Sales Gọi Tư vấn Báo giá", 6, null, "Gọi tư vấn chuyên sâu", "SALES_REP")
				),
				"2026-08-10 09:00:00"
		));
		defaults.add(new DripCampaignSummary(
				UUID.fromString("77000000-0000-0000-0000-000000000002"),
				"Chuỗi Kích hoạt Sau Ký kết Hợp đồng (Customer Onboarding Journey)",
				"Kịch bản hướng dẫn triển khai phần mềm, đào tạo nhân sự và kích hoạt bảo hành 12 tháng.",
				"CONTRACT_SIGNED",
				"EXISTING_CUSTOMERS",
				"ACTIVE",
				64,
				18,
				46,
				3,
				List.of(
						new DripStepDto(1, "EMAIL", "Thư Cảm ơn & Hướng dẫn Khởi tạo Tài khoản Admin", 0, "Khởi tạo hệ thống CRM của bạn", "Chào mừng doanh nghiệp...", "ADMIN"),
						new DripStepDto(2, "EMAIL", "Lịch Đào tạo Trực tuyến & Tài liệu Hướng dẫn Sử dụng", 3, "Lịch đào tạo phần mềm", "Gửi lịch đào tạo...", "ALL_USERS"),
						new DripStepDto(3, "CREATE_TASK", "Kiểm tra Mức độ Hài lòng Sau 14 Ngày Vận hành", 14, null, "CSKH khảo sát trải nghiệm", "CS_TEAM")
				),
				"2026-08-12 14:30:00"
		));
		defaults.add(new DripCampaignSummary(
				UUID.fromString("77000000-0000-0000-0000-000000000003"),
				"Chuỗi Chăm sóc Lại Lead Thất bại / Tạm dừng (Re-engagement Sequence)",
				"Tự động kích hoạt sau khi Lead bị chuyển trạng thái Unqualified hoặc Cơ hội Lost quá 30 ngày.",
				"DEAL_LOST",
				"LOST_LEADS",
				"ACTIVE",
				92,
				31,
				61,
				3,
				List.of(
						new DripStepDto(1, "EMAIL", "Khảo sát Lý do Chưa phù hợp & Nhận Góp ý", 7, "Khảo sát trải nghiệm dịch vụ", "Kính gửi anh/chị...", "ALL"),
						new DripStepDto(2, "EMAIL", "Gửi Mã Ưu đãi Đặc quyền Mùa Chuyển đổi số 2026", 21, "Ưu đãi tái kích hoạt đặc quyền", "Tặng voucher 15%...", "ALL"),
						new DripStepDto(3, "SMS", "SMS Thông báo Tính năng Mới vừa Cập nhật", 35, null, "CRM đã nâng cấp tính năng mới...", "ALL")
				),
				"2026-08-14 16:00:00"
		));
		return defaults;
	}
}
