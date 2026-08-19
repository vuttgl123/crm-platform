package com.crm.integration.webhook.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.integration.webhook.application.dto.CreateWebhookRequest;
import com.crm.integration.webhook.application.dto.TestWebhookResponse;
import com.crm.integration.webhook.application.dto.WebhookDeliveryLogDto;
import com.crm.integration.webhook.application.dto.WebhookSubscriptionDto;
import com.crm.integration.webhook.application.service.WebhookDispatcherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("webhookDispatcherController")
@RequestMapping("/api/integration/dispatcher/webhooks")
public class WebhookDispatcherController {

	private final WebhookDispatcherService webhookDispatcherService;

	public WebhookDispatcherController(WebhookDispatcherService webhookDispatcherService) {
		this.webhookDispatcherService = webhookDispatcherService;
	}

	@PostMapping
	public ResponseEntity<WebhookSubscriptionDto> createWebhook(@RequestBody CreateWebhookRequest request) {
		WebhookSubscriptionDto dto = webhookDispatcherService.createWebhook(request);
		return ResponseEntity.ok(dto);
	}

	@GetMapping
	public ResponseEntity<List<WebhookSubscriptionDto>> listWebhooks() {
		List<WebhookSubscriptionDto> list = webhookDispatcherService.listWebhooks();
		return ResponseEntity.ok(list);
	}

	@PostMapping("/{id}/test")
	public ResponseEntity<TestWebhookResponse> testWebhook(@PathVariable UUID id) {
		TestWebhookResponse res = webhookDispatcherService.testWebhook(id);
		return ResponseEntity.ok(res);
	}

	@GetMapping("/{id}/logs")
	public ResponseEntity<List<WebhookDeliveryLogDto>> getDeliveryLogs(@PathVariable UUID id) {
		List<WebhookDeliveryLogDto> logs = webhookDispatcherService.getDeliveryLogs(id);
		return ResponseEntity.ok(logs);
	}
}
