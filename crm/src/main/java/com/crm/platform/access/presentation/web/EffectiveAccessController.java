package com.crm.platform.access.presentation.web;

import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import com.crm.platform.access.application.usecase.EffectiveAccessFacade;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/access")
public final class EffectiveAccessController {

	private final EffectiveAccessFacade access;
	private final EffectiveAccessWebMapper mapper;

	public EffectiveAccessController(
			EffectiveAccessFacade access,
			EffectiveAccessWebMapper mapper) {
		this.access = access;
		this.mapper = mapper;
	}

	@GetMapping("/me")
	public ResponseEntity<EffectiveAccessResponse> current() {
		EffectiveAccessDetails details = access.current();
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore())
				.body(mapper.toResponse(details));
	}

}
