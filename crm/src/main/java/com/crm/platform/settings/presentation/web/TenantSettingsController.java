package com.crm.platform.settings.presentation.web;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import com.crm.platform.settings.application.dto.BillingInfoDto;
import com.crm.platform.settings.application.dto.BusinessHoursDto;
import com.crm.platform.settings.application.dto.ConsolidatedTenantSettingsDto;
import com.crm.platform.settings.application.dto.CurrencyRateDto;
import com.crm.platform.settings.application.dto.DigestScheduleDto;
import com.crm.platform.settings.application.dto.LocalizationSettingsDto;
import com.crm.platform.settings.application.dto.NotificationSettingsDto;
import com.crm.platform.settings.application.dto.TenantProfileDto;
import com.crm.platform.settings.application.usecase.TenantSettingsFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/settings")
public final class TenantSettingsController {

	private final TenantSettingsFacade facade;
	private final TenantSettingsWebMapper mapper;

	public TenantSettingsController(TenantSettingsFacade facade, TenantSettingsWebMapper mapper) {
		this.facade = facade;
		this.mapper = mapper;
	}

	// 1. Consolidated
	@GetMapping
	public ResponseEntity<ConsolidatedTenantSettingsDto> getConsolidated() {
		return ResponseEntity.ok(facade.getConsolidatedSettings());
	}

	@PatchMapping
	public ResponseEntity<ConsolidatedTenantSettingsDto> patchConsolidated(
			@Valid @RequestBody PatchConsolidatedSettingsRequest request) {
		return ResponseEntity.ok(facade.patchConsolidatedSettings(mapper.toCommand(request)));
	}

	// 2. Profile
	@GetMapping("/profile")
	public ResponseEntity<TenantProfileDto> getProfile() {
		return ResponseEntity.ok(facade.getProfile());
	}

	@PutMapping("/profile")
	public ResponseEntity<TenantProfileDto> updateProfile(
			@Valid @RequestBody UpdateProfileRequest request) {
		return ResponseEntity.ok(facade.updateProfile(mapper.toCommand(request)));
	}

	@PostMapping("/profile/logo")
	public ResponseEntity<TenantProfileDto> updateLogo(@RequestParam("logoUrl") String logoUrl) {
		return ResponseEntity.ok(facade.updateLogo(logoUrl));
	}

	@DeleteMapping("/profile/logo")
	public ResponseEntity<TenantProfileDto> resetLogo() {
		return ResponseEntity.ok(facade.resetLogo());
	}

	@GetMapping("/profile/billing-info")
	public ResponseEntity<BillingInfoDto> getBillingInfo() {
		return ResponseEntity.ok(facade.getBillingInfo());
	}

	@PutMapping("/profile/billing-info")
	public ResponseEntity<BillingInfoDto> updateBillingInfo(
			@Valid @RequestBody UpdateBillingInfoRequest request) {
		return ResponseEntity.ok(facade.updateBillingInfo(mapper.toCommand(request)));
	}

	// 3. Localization
	@GetMapping("/localization")
	public ResponseEntity<LocalizationSettingsDto> getLocalization() {
		return ResponseEntity.ok(facade.getLocalization());
	}

	@PutMapping("/localization")
	public ResponseEntity<LocalizationSettingsDto> updateLocalization(
			@Valid @RequestBody UpdateLocalizationRequest request) {
		return ResponseEntity.ok(facade.updateLocalization(mapper.toCommand(request)));
	}

	@GetMapping("/currencies")
	public ResponseEntity<List<CurrencyRateDto>> listCurrencies() {
		return ResponseEntity.ok(facade.listCurrencies());
	}

	@PostMapping("/currencies")
	public ResponseEntity<CurrencyRateDto> addCurrency(
			@Valid @RequestBody AddCurrencyRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(facade.addCurrency(mapper.toCommand(request)));
	}

	@PutMapping("/currencies/{currencyCode}")
	public ResponseEntity<CurrencyRateDto> updateCurrency(
			@PathVariable String currencyCode,
			@Valid @RequestBody UpdateCurrencyRateRequest request) {
		return ResponseEntity.ok(facade.updateCurrencyRate(currencyCode, mapper.toCommand(currencyCode, request)));
	}

	@DeleteMapping("/currencies/{currencyCode}")
	public ResponseEntity<Void> deleteCurrency(@PathVariable String currencyCode) {
		facade.deleteCurrency(currencyCode);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/business-hours")
	public ResponseEntity<BusinessHoursDto> getBusinessHours() {
		return ResponseEntity.ok(facade.getBusinessHours());
	}

	@PutMapping("/business-hours")
	public ResponseEntity<BusinessHoursDto> updateBusinessHours(
			@Valid @RequestBody UpdateBusinessHoursRequest request) {
		return ResponseEntity.ok(facade.updateBusinessHours(mapper.toCommand(request)));
	}

	// 4. Notifications & Digest
	@GetMapping("/notifications")
	public ResponseEntity<NotificationSettingsDto> getNotifications() {
		return ResponseEntity.ok(facade.getNotificationSettings());
	}

	@PutMapping("/notifications")
	public ResponseEntity<NotificationSettingsDto> updateNotifications(
			@Valid @RequestBody UpdateNotificationRequest request) {
		return ResponseEntity.ok(facade.updateNotificationSettings(mapper.toCommand(request)));
	}

	@PostMapping("/notifications/test")
	public ResponseEntity<Map<String, Object>> testNotificationPing(
			@Valid @RequestBody NotificationPingTestRequest request) {
		boolean success = facade.testNotificationPing(request.channelType(), request.targetEndpoint());
		return ResponseEntity.ok(Map.of("success", success, "message", "Ping delivered successfully"));
	}

	@GetMapping("/notifications/digest")
	public ResponseEntity<DigestScheduleDto> getDigest() {
		return ResponseEntity.ok(facade.getDigestSchedule());
	}

	@PutMapping("/notifications/digest")
	public ResponseEntity<DigestScheduleDto> updateDigest(
			@Valid @RequestBody UpdateDigestScheduleRequest request) {
		return ResponseEntity.ok(facade.updateDigestSchedule(mapper.toCommand(request)));
	}
}
