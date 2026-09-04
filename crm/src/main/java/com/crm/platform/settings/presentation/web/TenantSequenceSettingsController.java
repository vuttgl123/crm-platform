package com.crm.platform.settings.presentation.web;

import java.util.List;

import jakarta.validation.Valid;
import com.crm.platform.settings.application.dto.DocumentSequenceDto;
import com.crm.platform.settings.application.usecase.TenantSettingsFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/settings/document-sequences")
public final class TenantSequenceSettingsController {

	private final TenantSettingsFacade facade;
	private final TenantSettingsWebMapper mapper;

	public TenantSequenceSettingsController(TenantSettingsFacade facade, TenantSettingsWebMapper mapper) {
		this.facade = facade;
		this.mapper = mapper;
	}

	@GetMapping
	public ResponseEntity<List<DocumentSequenceDto>> list() {
		return ResponseEntity.ok(facade.listDocumentSequences());
	}

	@GetMapping("/{entityType}")
	public ResponseEntity<DocumentSequenceDto> get(@PathVariable String entityType) {
		return ResponseEntity.ok(facade.getDocumentSequence(entityType));
	}

	@PutMapping("/{entityType}")
	public ResponseEntity<DocumentSequenceDto> update(
			@PathVariable String entityType,
			@Valid @RequestBody UpdateDocumentSequenceRequest request) {
		return ResponseEntity.ok(facade.updateDocumentSequence(entityType, mapper.toCommand(request)));
	}

	@PostMapping("/{entityType}/reset")
	public ResponseEntity<DocumentSequenceDto> reset(
			@PathVariable String entityType,
			@Valid @RequestBody ResetDocumentSequenceRequest request) {
		return ResponseEntity.ok(facade.resetDocumentSequence(entityType, request.newCounter()));
	}
}
