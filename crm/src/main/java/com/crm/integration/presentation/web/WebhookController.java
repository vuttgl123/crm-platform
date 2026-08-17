package com.crm.integration.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.integration.application.dto.WebhookDeliveryDetails;
import com.crm.integration.application.dto.WebhookSubscriptionDetails;
import com.crm.integration.application.usecase.WebhookFacade;
import com.crm.integration.domain.WebhookDeliveryId;
import com.crm.integration.domain.WebhookSubscriptionId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integration/webhooks")
public final class WebhookController {

	private final WebhookFacade webhooks;
	private final WebhookWebMapper mapper;

	public WebhookController(WebhookFacade webhooks, WebhookWebMapper mapper) {
		this.webhooks = webhooks;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<WebhookSubscriptionResponse> create(@Valid @RequestBody CreateWebhookSubscriptionRequest request) {
		WebhookSubscriptionDetails created = webhooks.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public WebhookSubscriptionResponse get(@PathVariable UUID id) {
		return mapper.toResponse(webhooks.get(new WebhookSubscriptionId(id)));
	}

	@GetMapping
	public List<WebhookSubscriptionSummaryResponse> list() {
		return mapper.toSummaryResponseList(webhooks.list());
	}

	@PutMapping("/{id}")
	public WebhookSubscriptionResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateWebhookSubscriptionRequest request) {
		return mapper.toResponse(webhooks.update(mapper.toUpdateCommand(new WebhookSubscriptionId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		webhooks.delete(new WebhookSubscriptionId(id), IfMatchVersion.parse(ifMatch));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/ping")
	public WebhookDeliveryResponse ping(@PathVariable UUID id) {
		WebhookDeliveryDetails delivery = webhooks.ping(new WebhookSubscriptionId(id));
		return mapper.toDeliveryResponse(delivery);
	}

	@GetMapping("/{id}/deliveries")
	public PageResult<WebhookDeliveryResponse> listDeliveries(
			@PathVariable UUID id,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return mapper.toDeliveryPage(webhooks.listDeliveries(new WebhookSubscriptionId(id), PageQuery.of(page, size)));
	}

	@PostMapping("/{id}/deliveries/{deliveryId}/retry")
	public WebhookDeliveryResponse retryDelivery(
			@PathVariable UUID id,
			@PathVariable UUID deliveryId) {
		WebhookDeliveryDetails delivery = webhooks.retryDelivery(new WebhookSubscriptionId(id), new WebhookDeliveryId(deliveryId));
		return mapper.toDeliveryResponse(delivery);
	}

}
