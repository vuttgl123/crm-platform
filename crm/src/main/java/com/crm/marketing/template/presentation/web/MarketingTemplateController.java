package com.crm.marketing.template.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.marketing.template.application.dto.CreateMarketingTemplateRequest;
import com.crm.marketing.template.application.dto.MarketingTemplateSummary;
import com.crm.marketing.template.application.dto.PreviewMarketingTemplateRequest;
import com.crm.marketing.template.application.dto.PreviewMarketingTemplateResponse;
import com.crm.marketing.template.application.dto.UpdateMarketingTemplateRequest;
import com.crm.marketing.template.application.service.MarketingTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing/templates")
public class MarketingTemplateController {

	private final MarketingTemplateService templateService;

	public MarketingTemplateController(MarketingTemplateService templateService) {
		this.templateService = templateService;
	}

	@GetMapping
	public ResponseEntity<List<MarketingTemplateSummary>> listTemplates(
			@RequestParam(required = false) String channel,
			@RequestParam(required = false) String category
	) {
		List<MarketingTemplateSummary> list = templateService.listTemplates(channel, category);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/{id}")
	public ResponseEntity<MarketingTemplateSummary> getTemplate(@PathVariable UUID id) {
		MarketingTemplateSummary summary = templateService.getTemplate(id);
		return ResponseEntity.ok(summary);
	}

	@PostMapping
	public ResponseEntity<MarketingTemplateSummary> createTemplate(@Valid @RequestBody CreateMarketingTemplateRequest request) {
		MarketingTemplateSummary created = templateService.createTemplate(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<MarketingTemplateSummary> updateTemplate(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateMarketingTemplateRequest request
	) {
		MarketingTemplateSummary updated = templateService.updateTemplate(id, request);
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
		templateService.deleteTemplate(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/preview")
	public ResponseEntity<PreviewMarketingTemplateResponse> previewTemplate(@RequestBody PreviewMarketingTemplateRequest request) {
		PreviewMarketingTemplateResponse response = templateService.previewTemplate(request);
		return ResponseEntity.ok(response);
	}
}
