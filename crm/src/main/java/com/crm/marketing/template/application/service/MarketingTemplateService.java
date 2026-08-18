package com.crm.marketing.template.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.marketing.template.application.dto.CreateMarketingTemplateRequest;
import com.crm.marketing.template.application.dto.MarketingTemplateSummary;
import com.crm.marketing.template.application.dto.PreviewMarketingTemplateRequest;
import com.crm.marketing.template.application.dto.PreviewMarketingTemplateResponse;
import com.crm.marketing.template.application.dto.UpdateMarketingTemplateRequest;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class MarketingTemplateService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	// In-memory store per tenant
	private final ConcurrentHashMap<String, List<MarketingTemplateSummary>> templateStore = new ConcurrentHashMap<>();

	public MarketingTemplateService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public List<MarketingTemplateSummary> listTemplates(String channel, String category) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		List<MarketingTemplateSummary> list = templateStore.get(tenantId.value().toString());
		if (list == null || list.isEmpty()) {
			List<MarketingTemplateSummary> defaults = seedDefaultTemplates();
			templateStore.put(tenantId.value().toString(), defaults);
			list = defaults;
		}

		return list.stream()
				.filter(t -> channel == null || channel.equalsIgnoreCase("ALL") || t.channel().equalsIgnoreCase(channel))
				.filter(t -> category == null || category.equalsIgnoreCase("ALL") || t.category().equalsIgnoreCase(category))
				.toList();
	}

	public MarketingTemplateSummary getTemplate(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		return listTemplates(null, null).stream()
				.filter(t -> t.id().equals(id))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mẫu nội dung tiếp thị với ID: " + id));
	}

	public MarketingTemplateSummary createTemplate(CreateMarketingTemplateRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		UUID id = UUID.randomUUID();
		List<String> variables = request.variables() != null ? request.variables() : extractVariables(request.content());

		MarketingTemplateSummary summary = new MarketingTemplateSummary(
				id,
				request.name(),
				request.channel(),
				request.category() != null ? request.category() : "NURTURE",
				request.subject(),
				request.content(),
				variables,
				request.status() != null ? request.status() : "ACTIVE",
				0,
				"2026-08-18 10:00:00"
		);

		templateStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>()).add(0, summary);
		return summary;
	}

	public MarketingTemplateSummary updateTemplate(UUID id, UpdateMarketingTemplateRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		List<MarketingTemplateSummary> list = templateStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>(seedDefaultTemplates()));
		for (int i = 0; i < list.size(); i++) {
			if (list.get(i).id().equals(id)) {
				MarketingTemplateSummary existing = list.get(i);
				List<String> variables = request.variables() != null ? request.variables() : extractVariables(request.content());
				MarketingTemplateSummary updated = new MarketingTemplateSummary(
						id,
						request.name(),
						request.channel(),
						request.category() != null ? request.category() : existing.category(),
						request.subject(),
						request.content(),
						variables,
						request.status() != null ? request.status() : existing.status(),
						existing.usageCount(),
						"2026-08-18 11:30:00"
				);
				list.set(i, updated);
				return updated;
			}
		}

		throw new IllegalArgumentException("Không tìm thấy mẫu tiếp thị để cập nhật: " + id);
	}

	public void deleteTemplate(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_WRITE);

		List<MarketingTemplateSummary> list = templateStore.get(tenantId.value().toString());
		if (list != null) {
			list.removeIf(t -> t.id().equals(id));
		}
	}

	public PreviewMarketingTemplateResponse previewTemplate(PreviewMarketingTemplateRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.MARKETING_CAMPAIGN_READ);

		String renderedSubject = request.subject();
		String renderedContent = request.content();

		Map<String, String> data = request.sampleData() != null ? request.sampleData() : Map.of(
				"lead.name", "Nguyễn Văn Tuấn",
				"lead.company", "Tập đoàn Công nghệ FPT",
				"lead.score", "85",
				"consultant.name", "Trần Thị Mai",
				"consultant.phone", "0988 123 456",
				"promo.code", "VIPCRM2026"
		);

		for (Map.Entry<String, String> entry : data.entrySet()) {
			String key = "{{" + entry.getKey() + "}}";
			if (renderedSubject != null) {
				renderedSubject = renderedSubject.replace(key, entry.getValue());
			}
			if (renderedContent != null) {
				renderedContent = renderedContent.replace(key, entry.getValue());
			}
		}

		return new PreviewMarketingTemplateResponse(renderedSubject, renderedContent);
	}

	private List<String> extractVariables(String content) {
		if (content == null) return List.of();
		List<String> found = new ArrayList<>();
		java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\{\\{([^}]+)\\}\\}").matcher(content);
		while (m.find()) {
			String var = m.group(1).trim();
			if (!found.contains(var)) {
				found.add(var);
			}
		}
		return found;
	}

	private List<MarketingTemplateSummary> seedDefaultTemplates() {
		List<MarketingTemplateSummary> seeds = new ArrayList<>();
		seeds.add(new MarketingTemplateSummary(
				UUID.fromString("88000000-0000-0000-0000-000000000001"),
				"Email Chào mừng Lead Mới (Welcome Sequence)",
				"EMAIL",
				"WELCOME",
				"Chào mừng {{lead.name}} đến với Hệ sinh thái Giải pháp Doanh nghiệp",
				"Kính gửi Anh/Chị {{lead.name}},\n\nCảm ơn {{lead.name}} từ công ty {{lead.company}} đã đăng ký tìm hiểu giải pháp CRM của chúng tôi.\n\nChuyên viên tư vấn {{consultant.name}} (Hotline: {{consultant.phone}}) sẽ liên hệ trong vòng 15 phút để hỗ trợ.\n\nTrân trọng,\nĐội ngũ CRM",
				List.of("lead.name", "lead.company", "consultant.name", "consultant.phone"),
				"ACTIVE",
				186,
				"2026-08-15 08:30:00"
		));
		seeds.add(new MarketingTemplateSummary(
				UUID.fromString("88000000-0000-0000-0000-000000000002"),
				"SMS Nhắc Lịch Demo Trực tuyến",
				"SMS",
				"NURTURE",
				null,
				"CRM Cloud: Chào {{lead.name}}, lịch trải nghiệm Demo phần mềm của bạn diễn ra lúc 14h00 hôm nay. Mã xác nhận ưu đãi: {{promo.code}}. Hotline hỗ trợ: {{consultant.phone}}.",
				List.of("lead.name", "promo.code", "consultant.phone"),
				"ACTIVE",
				94,
				"2026-08-16 11:20:00"
		));
		seeds.add(new MarketingTemplateSummary(
				UUID.fromString("88000000-0000-0000-0000-000000000003"),
				"Email Gửi Báo giá & Khuyến mãi Q3 (Special Deal Promotion)",
				"EMAIL",
				"PROMOTION",
				"Ưu đãi đặc quyền 20% bản quyền CRM dành riêng cho {{lead.company}}",
				"Kính gửi {{lead.name}},\n\nĐể đồng hành cùng mục tiêu tối ưu vận hành của {{lead.company}}, chúng tôi xin gửi tặng mã giảm giá {{promo.code}} áp dụng cho hợp đồng ký trong tháng này.\n\nVui lòng phản hồi email này để nhận bảng chiết khấu chi tiết.\n\nChuyên viên: {{consultant.name}}",
				List.of("lead.name", "lead.company", "promo.code", "consultant.name"),
				"ACTIVE",
				52,
				"2026-08-17 14:15:00"
		));
		return seeds;
	}
}
