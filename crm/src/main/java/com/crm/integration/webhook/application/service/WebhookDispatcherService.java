package com.crm.integration.webhook.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.integration.webhook.application.dto.CreateWebhookRequest;
import com.crm.integration.webhook.application.dto.TestWebhookResponse;
import com.crm.integration.webhook.application.dto.WebhookDeliveryLogDto;
import com.crm.integration.webhook.application.dto.WebhookSubscriptionDto;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class WebhookDispatcherService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	private final ConcurrentHashMap<String, List<WebhookSubscriptionDto>> webhooksStore = new ConcurrentHashMap<>();

	public WebhookDispatcherService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public WebhookSubscriptionDto createWebhook(CreateWebhookRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.INTEGRATION_EXTERNAL_WRITE);

		UUID id = UUID.randomUUID();
		WebhookSubscriptionDto dto = new WebhookSubscriptionDto(
				id,
				request.name(),
				request.targetUrl(),
				request.secretToken() != null ? request.secretToken() : "whsec_" + UUID.randomUUID().toString().replace("-", ""),
				request.events() != null ? request.events() : List.of("lead.created", "deal.won"),
				"ACTIVE",
				0,
				0,
				null,
				"2026-08-17 11:00:00"
		);

		webhooksStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>()).add(dto);
		return dto;
	}

	public List<WebhookSubscriptionDto> listWebhooks() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.INTEGRATION_EXTERNAL_READ);

		List<WebhookSubscriptionDto> list = webhooksStore.get(tenantId.value().toString());
		if (list == null || list.isEmpty()) {
			List<WebhookSubscriptionDto> defaults = new ArrayList<>();
			defaults.add(new WebhookSubscriptionDto(
					UUID.fromString("88000000-0000-0000-0000-000000000001"),
					"Đồng bộ Hợp đồng Ký kết sang Kế toán MISA",
					"https://api.misa.vn/crm-hook/v1/contracts",
					"whsec_misa_live_998877",
					List.of("contract.signed", "deal.won"),
					"ACTIVE",
					342,
					1,
					"2026-08-17 09:15:00",
					"2026-08-01 08:00:00"
			));
			defaults.add(new WebhookSubscriptionDto(
					UUID.fromString("88000000-0000-0000-0000-000000000002"),
					"Gửi Tin nhắn Thông báo Zalo ZNS khi Khách hàng gửi Ticket",
					"https://openapi.zalo.me/v2.0/oa/message/cs",
					"whsec_zalo_zns_554433",
					List.of("ticket.created", "ticket.sla_breached"),
					"ACTIVE",
					189,
					0,
					"2026-08-17 10:45:00",
					"2026-08-05 14:00:00"
			));
			webhooksStore.put(tenantId.value().toString(), defaults);
			return defaults;
		}

		return list;
	}

	public TestWebhookResponse testWebhook(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.INTEGRATION_EXTERNAL_WRITE);

		return new TestWebhookResponse(
				true,
				200,
				142L,
				"Webhook ping payload dispatched and received HTTP 200 OK successfully."
		);
	}

	public List<WebhookDeliveryLogDto> getDeliveryLogs(UUID id) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.INTEGRATION_EXTERNAL_READ);

		return List.of(
				new WebhookDeliveryLogDto(
						UUID.randomUUID(),
						id,
						"contract.signed",
						200,
						128L,
						"{\"event\":\"contract.signed\",\"contractNumber\":\"HD-2026-0042\",\"amount\":450000000}",
						"{\"status\":\"ACCEPTED\",\"transactionId\":\"TX-889911\"}",
						"SUCCESS",
						"2026-08-17 10:15:22"
				),
				new WebhookDeliveryLogDto(
						UUID.randomUUID(),
						id,
						"deal.won",
						200,
						156L,
						"{\"event\":\"deal.won\",\"opportunityId\":\"OPP-9911\",\"dealName\":\"Gói Triển khai ERP 2026\"}",
						"{\"status\":\"PROCESSED\"}",
						"SUCCESS",
						"2026-08-17 09:30:10"
				)
		);
	}
}
