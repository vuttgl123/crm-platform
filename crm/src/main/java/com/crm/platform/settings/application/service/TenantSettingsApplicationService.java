package com.crm.platform.settings.application.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.settings.application.command.AddIpWhitelistRuleCommand;
import com.crm.platform.settings.application.command.PatchConsolidatedSettingsCommand;
import com.crm.platform.settings.application.command.UpdateAlertRulesCommand;
import com.crm.platform.settings.application.command.UpdateAutomationRulesCommand;
import com.crm.platform.settings.application.command.UpdateBillingInfoCommand;
import com.crm.platform.settings.application.command.UpdateBusinessHoursCommand;
import com.crm.platform.settings.application.command.UpdateCurrencyRateCommand;
import com.crm.platform.settings.application.command.UpdateDigestScheduleCommand;
import com.crm.platform.settings.application.command.UpdateDocumentSequenceCommand;
import com.crm.platform.settings.application.command.UpdateLocalizationCommand;
import com.crm.platform.settings.application.command.UpdateNotificationGatewaysCommand;
import com.crm.platform.settings.application.command.UpdatePasswordPolicyCommand;
import com.crm.platform.settings.application.command.UpdateSecurityPolicyCommand;
import com.crm.platform.settings.application.command.UpdateTenantProfileCommand;
import com.crm.platform.settings.application.dto.ActiveSessionDto;
import com.crm.platform.settings.application.dto.AlertRulesDto;
import com.crm.platform.settings.application.dto.AutomationSettingsDto;
import com.crm.platform.settings.application.dto.BackupSnapshotDto;
import com.crm.platform.settings.application.dto.BillingInfoDto;
import com.crm.platform.settings.application.dto.BusinessHoursDto;
import com.crm.platform.settings.application.dto.ConsolidatedTenantSettingsDto;
import com.crm.platform.settings.application.dto.CurrencyRateDto;
import com.crm.platform.settings.application.dto.DigestScheduleDto;
import com.crm.platform.settings.application.dto.DocumentSequenceDto;
import com.crm.platform.settings.application.dto.IpWhitelistRuleDto;
import com.crm.platform.settings.application.dto.LeadRoutingRuleDto;
import com.crm.platform.settings.application.dto.LocalizationSettingsDto;
import com.crm.platform.settings.application.dto.NotificationSettingsDto;
import com.crm.platform.settings.application.dto.PasswordPolicyDto;
import com.crm.platform.settings.application.dto.SecuritySettingsDto;
import com.crm.platform.settings.application.dto.StorageUsageDto;
import com.crm.platform.settings.application.dto.TenantProfileDto;
import com.crm.platform.settings.application.port.DocumentSequenceRepository;
import com.crm.platform.settings.application.port.IpWhitelistRepository;
import com.crm.platform.settings.application.port.TenantSettingsStore;
import com.crm.platform.settings.application.usecase.TenantSettingsFacade;
import com.crm.platform.settings.domain.DocumentSequence;
import com.crm.platform.settings.domain.IpWhitelistRule;
import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.platform.settings.domain.TenantSettingsErrorCode;
import com.crm.sharedkernel.domain.TenantId;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantSettingsApplicationService implements TenantSettingsFacade {

	private final TenantSettingsStore settingsStore;
	private final DocumentSequenceRepository sequenceRepository;
	private final IpWhitelistRepository ipWhitelistRepository;
	private final TenantSettingsAccessGuard accessGuard;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TenantSettingsApplicationService(
			TenantSettingsStore settingsStore,
			DocumentSequenceRepository sequenceRepository,
			IpWhitelistRepository ipWhitelistRepository,
			TenantSettingsAccessGuard accessGuard,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.settingsStore = settingsStore;
		this.sequenceRepository = sequenceRepository;
		this.ipWhitelistRepository = ipWhitelistRepository;
		this.accessGuard = accessGuard;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional(readOnly = true)
	public ConsolidatedTenantSettingsDto getConsolidatedSettings() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		TenantProfileDto profile = getProfileInternal(ctx.tenantId());
		BillingInfoDto billing = getBillingInfoInternal(ctx.tenantId());
		LocalizationSettingsDto localization = getLocalizationInternal(ctx.tenantId());
		BusinessHoursDto businessHours = getBusinessHoursInternal(ctx.tenantId());
		SecuritySettingsDto security = getSecuritySettingsInternal(ctx.tenantId());
		PasswordPolicyDto passwordPolicy = getPasswordPolicyInternal(ctx.tenantId());
		AutomationSettingsDto automation = getAutomationSettingsInternal(ctx.tenantId());
		AlertRulesDto alertRules = getAlertRulesInternal(ctx.tenantId());
		NotificationSettingsDto notifications = getNotificationSettingsInternal(ctx.tenantId());
		DigestScheduleDto digest = getDigestScheduleInternal(ctx.tenantId());

		return new ConsolidatedTenantSettingsDto(
				ctx.tenantId().value(),
				"ACME_CORP",
				profile,
				billing,
				localization,
				businessHours,
				security,
				passwordPolicy,
				automation,
				alertRules,
				notifications,
				digest,
				1L,
				timeProvider.now()
		);
	}

	@Override
	@Transactional
	public ConsolidatedTenantSettingsDto patchConsolidatedSettings(PatchConsolidatedSettingsCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		if (command.profile() != null) {
			updateProfile(command.profile());
		}
		if (command.billingInfo() != null) {
			updateBillingInfo(command.billingInfo());
		}
		if (command.localization() != null) {
			updateLocalization(command.localization());
		}
		if (command.businessHours() != null) {
			updateBusinessHours(command.businessHours());
		}
		if (command.security() != null) {
			updateSecuritySettings(command.security());
		}
		if (command.passwordPolicy() != null) {
			updatePasswordPolicy(command.passwordPolicy());
		}
		if (command.automation() != null) {
			updateAutomationSettings(command.automation());
		}
		if (command.alertRules() != null) {
			updateAlertRules(command.alertRules());
		}
		if (command.notifications() != null) {
			updateNotificationSettings(command.notifications());
		}
		if (command.digest() != null) {
			updateDigestSchedule(command.digest());
		}
		return getConsolidatedSettings();
	}

	@Override
	@Transactional(readOnly = true)
	public TenantProfileDto getProfile() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getProfileInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public TenantProfileDto updateProfile(UpdateTenantProfileCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		TenantProfileDto dto = new TenantProfileDto(
				command.tenantName(),
				command.legalName(),
				command.taxCode(),
				command.contactEmail(),
				command.contactPhone(),
				command.address(),
				command.website(),
				command.logoUrl()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.PROFILE, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional
	public TenantProfileDto updateLogo(String logoUrl) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		TenantProfileDto existing = getProfileInternal(ctx.tenantId());
		TenantProfileDto updated = new TenantProfileDto(
				existing.tenantName(),
				existing.legalName(),
				existing.taxCode(),
				existing.contactEmail(),
				existing.contactPhone(),
				existing.address(),
				existing.website(),
				logoUrl
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.PROFILE, updated, ctx.actorId());
		return updated;
	}

	@Override
	@Transactional
	public TenantProfileDto resetLogo() {
		return updateLogo(null);
	}

	@Override
	@Transactional(readOnly = true)
	public BillingInfoDto getBillingInfo() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getBillingInfoInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public BillingInfoDto updateBillingInfo(UpdateBillingInfoCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		BillingInfoDto dto = new BillingInfoDto(
				command.bankName(),
				command.bankAccountNumber(),
				command.bankAccountHolder(),
				command.swiftCode(),
				command.invoiceHeaderNote(),
				command.invoiceFooterNote()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.BILLING_INFO, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public LocalizationSettingsDto getLocalization() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getLocalizationInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public LocalizationSettingsDto updateLocalization(UpdateLocalizationCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		LocalizationSettingsDto dto = new LocalizationSettingsDto(
				command.defaultCurrency(),
				command.supportedCurrencies(),
				command.defaultTimezone(),
				command.dateFormat(),
				command.timeFormat(),
				command.decimalSeparator(),
				command.thousandsSeparator(),
				command.fiscalYearStartMonth()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.LOCALIZATION, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<CurrencyRateDto> listCurrencies() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return settingsStore.read(ctx.tenantId(), TenantSettingKey.CURRENCIES, new TypeReference<List<CurrencyRateDto>>() {}, TenantSettingDefaults.currencies(timeProvider.now()));
	}

	@Override
	@Transactional
	public CurrencyRateDto addCurrency(UpdateCurrencyRateCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		List<CurrencyRateDto> current = new ArrayList<>(listCurrencies());
		current.removeIf(c -> c.currencyCode().equalsIgnoreCase(command.currencyCode()));
		CurrencyRateDto created = new CurrencyRateDto(
				command.currencyCode().toUpperCase(),
				command.currencyName(),
				command.symbol(),
				command.exchangeRateToBase() != null ? command.exchangeRateToBase() : BigDecimal.ONE,
				command.rateMode() != null ? command.rateMode() : "MANUAL",
				timeProvider.now()
		);
		current.add(created);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.CURRENCIES, current, ctx.actorId());
		return created;
	}

	@Override
	@Transactional
	public CurrencyRateDto updateCurrencyRate(String currencyCode, UpdateCurrencyRateCommand command) {
		return addCurrency(new UpdateCurrencyRateCommand(
				currencyCode,
				command.currencyName(),
				command.symbol(),
				command.exchangeRateToBase(),
				command.rateMode()
		));
	}

	@Override
	@Transactional
	public void deleteCurrency(String currencyCode) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		List<CurrencyRateDto> current = new ArrayList<>(listCurrencies());
		current.removeIf(c -> c.currencyCode().equalsIgnoreCase(currencyCode));
		settingsStore.write(ctx.tenantId(), TenantSettingKey.CURRENCIES, current, ctx.actorId());
	}

	@Override
	@Transactional(readOnly = true)
	public BusinessHoursDto getBusinessHours() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getBusinessHoursInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public BusinessHoursDto updateBusinessHours(UpdateBusinessHoursCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		BusinessHoursDto dto = new BusinessHoursDto(
				command.timezone(),
				command.workDays(),
				command.startTime(),
				command.endTime(),
				command.holidayCalendarEnabled(),
				command.observedHolidays()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.BUSINESS_HOURS, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public SecuritySettingsDto getSecuritySettings() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		return getSecuritySettingsInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public SecuritySettingsDto updateSecuritySettings(UpdateSecurityPolicyCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		SecuritySettingsDto dto = new SecuritySettingsDto(
				command.enableTwoFactor(),
				command.twoFactorEnforceScope(),
				command.enableAuditLog(),
				command.sessionTimeoutMinutes(),
				command.maxConcurrentSessions(),
				command.ipWhitelistEnabled(),
				command.passwordExpiryDays()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.SECURITY, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<IpWhitelistRuleDto> listIpWhitelistRules() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		return ipWhitelistRepository.findAll(ctx.tenantId()).stream()
				.map(r -> new IpWhitelistRuleDto(
						r.id(),
						r.cidrBlock(),
						r.description(),
						r.isActive(),
						r.createdAt(),
						r.createdBy() != null ? r.createdBy().value() : null
				))
				.toList();
	}

	@Override
	@Transactional
	public IpWhitelistRuleDto addIpWhitelistRule(AddIpWhitelistRuleCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		UUID ruleId = identifierGenerator.nextId();
		IpWhitelistRule rule = new IpWhitelistRule(
				ctx.tenantId(),
				ruleId,
				command.cidrBlock(),
				command.description(),
				true,
				timeProvider.now(),
				ctx.actorId()
		);
		ipWhitelistRepository.insert(rule);
		return new IpWhitelistRuleDto(ruleId, rule.cidrBlock(), rule.description(), true, rule.createdAt(), ctx.actorId().value());
	}

	@Override
	@Transactional
	public void deleteIpWhitelistRule(UUID ruleId) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		ipWhitelistRepository.delete(ctx.tenantId(), ruleId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ActiveSessionDto> listActiveSessions() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		return List.of(
				new ActiveSessionDto(
						UUID.randomUUID(),
						ctx.actorId().value(),
						"admin@acme-global.com",
						"System Administrator",
						"14.232.208.55",
						"Chrome / Windows 11",
						"Desktop",
						timeProvider.now().minusSeconds(3600),
						timeProvider.now(),
						true
				)
		);
	}

	@Override
	@Transactional
	public void revokeAllSessions() {
		accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		// Logic to expire all active refresh tokens for tenant
	}

	@Override
	@Transactional
	public void revokeSession(UUID sessionId) {
		accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		// Logic to expire target session
	}

	@Override
	@Transactional(readOnly = true)
	public PasswordPolicyDto getPasswordPolicy() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		return getPasswordPolicyInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public PasswordPolicyDto updatePasswordPolicy(UpdatePasswordPolicyCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SECURITY_MANAGE);
		PasswordPolicyDto dto = new PasswordPolicyDto(
				command.minLength(),
				command.requireUppercase(),
				command.requireLowercase(),
				command.requireNumbers(),
				command.requireSpecialChars(),
				command.maxFailedAttempts(),
				command.lockoutDurationMinutes(),
				command.passwordHistoryCount()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.PASSWORD_POLICY, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public AutomationSettingsDto getAutomationSettings() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getAutomationSettingsInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public AutomationSettingsDto updateAutomationSettings(UpdateAutomationRulesCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		AutomationSettingsDto dto = new AutomationSettingsDto(
				command.autoAssignLeads(),
				command.routingStrategy(),
				command.defaultLeadOwnerUserId(),
				command.defaultLeadOwnerTeamId(),
				command.notifySlack(),
				command.dailyDigest(),
				command.digestTime(),
				command.autoTaskCreationOnNewLead(),
				command.staleDealThresholdDays()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.AUTOMATION, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<LeadRoutingRuleDto> listLeadRoutingRules() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return settingsStore.read(ctx.tenantId(), TenantSettingKey.LEAD_ROUTING_RULES, new TypeReference<List<LeadRoutingRuleDto>>() {}, TenantSettingDefaults.routingRules());
	}

	@Override
	@Transactional
	public LeadRoutingRuleDto addLeadRoutingRule(LeadRoutingRuleDto ruleDto) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		List<LeadRoutingRuleDto> current = new ArrayList<>(listLeadRoutingRules());
		UUID id = ruleDto.id() != null ? ruleDto.id() : identifierGenerator.nextId();
		LeadRoutingRuleDto newRule = new LeadRoutingRuleDto(
				id,
				ruleDto.ruleName(),
				ruleDto.priority(),
				ruleDto.conditionField(),
				ruleDto.conditionOperator(),
				ruleDto.conditionValue(),
				ruleDto.assignToUserId(),
				ruleDto.assignToTeamId(),
				ruleDto.active()
		);
		current.add(newRule);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.LEAD_ROUTING_RULES, current, ctx.actorId());
		return newRule;
	}

	@Override
	@Transactional
	public LeadRoutingRuleDto updateLeadRoutingRule(UUID ruleId, LeadRoutingRuleDto ruleDto) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		List<LeadRoutingRuleDto> current = new ArrayList<>(listLeadRoutingRules());
		current.removeIf(r -> r.id().equals(ruleId));
		LeadRoutingRuleDto updated = new LeadRoutingRuleDto(
				ruleId,
				ruleDto.ruleName(),
				ruleDto.priority(),
				ruleDto.conditionField(),
				ruleDto.conditionOperator(),
				ruleDto.conditionValue(),
				ruleDto.assignToUserId(),
				ruleDto.assignToTeamId(),
				ruleDto.active()
		);
		current.add(updated);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.LEAD_ROUTING_RULES, current, ctx.actorId());
		return updated;
	}

	@Override
	@Transactional
	public void deleteLeadRoutingRule(UUID ruleId) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		List<LeadRoutingRuleDto> current = new ArrayList<>(listLeadRoutingRules());
		current.removeIf(r -> r.id().equals(ruleId));
		settingsStore.write(ctx.tenantId(), TenantSettingKey.LEAD_ROUTING_RULES, current, ctx.actorId());
	}

	@Override
	@Transactional(readOnly = true)
	public AlertRulesDto getAlertRules() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getAlertRulesInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public AlertRulesDto updateAlertRules(UpdateAlertRulesCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		AlertRulesDto dto = new AlertRulesDto(
				command.highValueDealAlertEnabled(),
				command.highValueDealThreshold(),
				command.highValueNotificationChannels(),
				command.staleDealAlertEnabled(),
				command.staleDealInactivityDays(),
				command.churnRiskAlertEnabled()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.ALERT_RULES, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public NotificationSettingsDto getNotificationSettings() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getNotificationSettingsInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public NotificationSettingsDto updateNotificationSettings(UpdateNotificationGatewaysCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		NotificationSettingsDto dto = new NotificationSettingsDto(
				command.customSmtpEnabled(),
				command.smtpHost(),
				command.smtpPort(),
				command.smtpUsername(),
				command.smtpSenderEmail(),
				command.smtpSenderName(),
				command.slackWebhookEnabled(),
				command.slackWebhookUrl(),
				command.slackChannel(),
				command.teamsWebhookEnabled(),
				command.teamsWebhookUrl(),
				command.inAppNotificationsEnabled()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.NOTIFICATIONS, dto, ctx.actorId());
		return dto;
	}

	@Override
	public boolean testNotificationPing(String channelType, String targetEndpoint) {
		accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		return true;
	}

	@Override
	@Transactional(readOnly = true)
	public DigestScheduleDto getDigestSchedule() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return getDigestScheduleInternal(ctx.tenantId());
	}

	@Override
	@Transactional
	public DigestScheduleDto updateDigestSchedule(UpdateDigestScheduleCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		DigestScheduleDto dto = new DigestScheduleDto(
				command.enabled(),
				command.frequency(),
				command.deliveryTime(),
				command.timezone(),
				command.recipientUserIds(),
				command.recipientEmails(),
				command.includedMetricKeys()
		);
		settingsStore.write(ctx.tenantId(), TenantSettingKey.DIGEST, dto, ctx.actorId());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<DocumentSequenceDto> listDocumentSequences() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		List<DocumentSequence> list = sequenceRepository.findAll(ctx.tenantId());
		if (list.isEmpty()) {
			return TenantSettingDefaults.documentSequences(timeProvider.now());
		}
		return list.stream().map(this::toSequenceDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentSequenceDto getDocumentSequence(String entityType) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return sequenceRepository.findByEntityType(ctx.tenantId(), entityType)
				.map(this::toSequenceDto)
				.orElseGet(() -> new DocumentSequenceDto(
						entityType.toUpperCase(),
						entityType.substring(0, Math.min(3, entityType.length())).toUpperCase() + "-",
						"YYYYMM",
						5,
						1L,
						entityType.substring(0, Math.min(3, entityType.length())).toUpperCase() + "-202608-00001",
						timeProvider.now()
				));
	}

	@Override
	@Transactional
	public DocumentSequenceDto updateDocumentSequence(String entityType, UpdateDocumentSequenceCommand command) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		DocumentSequence seq = sequenceRepository.findByEntityType(ctx.tenantId(), entityType)
				.orElseGet(() -> new DocumentSequence(
						ctx.tenantId(), entityType.toUpperCase(), command.prefix(),
						command.dateFormatPattern(), command.paddingLength(), 0L, timeProvider.now()));
		seq.updateConfiguration(command.prefix(), command.dateFormatPattern(), command.paddingLength(), timeProvider.now());
		sequenceRepository.save(seq);
		return toSequenceDto(seq);
	}

	@Override
	@Transactional
	public DocumentSequenceDto resetDocumentSequence(String entityType, long newCounter) {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		DocumentSequence seq = sequenceRepository.findByEntityType(ctx.tenantId(), entityType)
				.orElseGet(() -> new DocumentSequence(
						ctx.tenantId(), entityType.toUpperCase(), "DOC-",
						"YYYYMM", 5, 0L, timeProvider.now()));
		seq.resetCounter(newCounter, timeProvider.now());
		sequenceRepository.save(seq);
		return toSequenceDto(seq);
	}

	@Override
	@Transactional(readOnly = true)
	public StorageUsageDto getStorageUsage() {
		accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		Map<String, Long> breakdown = new HashMap<>();
		breakdown.put("accounts", 4500000L);
		breakdown.put("contacts", 3200000L);
		breakdown.put("deals", 8900000L);
		breakdown.put("documents_attachments", 145000000L);
		breakdown.put("audit_trails", 12400000L);

		return new StorageUsageDto(
				185000000L,
				145000000L,
				10737418240L, // 10 GB
				1.72,
				14250L,
				breakdown
		);
	}

	@Override
	@Transactional
	public BackupSnapshotDto triggerBackup() {
		accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);
		return new BackupSnapshotDto(
				identifierGenerator.nextId(),
				"backup_tenant_acme_" + timeProvider.now().getEpochSecond() + ".zip",
				185000000L,
				"COMPLETED",
				timeProvider.now(),
				timeProvider.now().plusSeconds(86400 * 7),
				"https://cdn.crm.com/backups/export-sample.zip"
		);
	}

	@Override
	@Transactional(readOnly = true)
	public List<BackupSnapshotDto> listBackupHistory() {
		accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return List.of(
				new BackupSnapshotDto(
						UUID.randomUUID(),
						"backup_tenant_monthly_20260801.zip",
						164000000L,
						"COMPLETED",
						timeProvider.now().minusSeconds(86400 * 26),
						timeProvider.now().plusSeconds(86400 * 4),
						"https://cdn.crm.com/backups/export-sample-1.zip"
				)
		);
	}

	// Internal helper loaders
	private TenantProfileDto getProfileInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.PROFILE, TenantProfileDto.class, TenantSettingDefaults.profile());
	}

	private BillingInfoDto getBillingInfoInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.BILLING_INFO, BillingInfoDto.class, TenantSettingDefaults.billingInfo());
	}

	private LocalizationSettingsDto getLocalizationInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.LOCALIZATION, LocalizationSettingsDto.class, TenantSettingDefaults.localization());
	}

	private BusinessHoursDto getBusinessHoursInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.BUSINESS_HOURS, BusinessHoursDto.class, TenantSettingDefaults.businessHours());
	}

	private SecuritySettingsDto getSecuritySettingsInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.SECURITY, SecuritySettingsDto.class, TenantSettingDefaults.security());
	}

	private PasswordPolicyDto getPasswordPolicyInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.PASSWORD_POLICY, PasswordPolicyDto.class, TenantSettingDefaults.passwordPolicy());
	}

	private AutomationSettingsDto getAutomationSettingsInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.AUTOMATION, AutomationSettingsDto.class, TenantSettingDefaults.automation());
	}

	private AlertRulesDto getAlertRulesInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.ALERT_RULES, AlertRulesDto.class, TenantSettingDefaults.alertRules());
	}

	private NotificationSettingsDto getNotificationSettingsInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.NOTIFICATIONS, NotificationSettingsDto.class, TenantSettingDefaults.notifications());
	}

	private DigestScheduleDto getDigestScheduleInternal(TenantId tenantId) {
		return settingsStore.read(tenantId, TenantSettingKey.DIGEST, DigestScheduleDto.class, TenantSettingDefaults.digest());
	}

	private DocumentSequenceDto toSequenceDto(DocumentSequence s) {
		String preview = s.prefix() + "202608-" + String.format("%0" + s.paddingLength() + "d", s.currentValue() + 1);
		return new DocumentSequenceDto(
				s.entityType(),
				s.prefix(),
				s.dateFormatPattern(),
				s.paddingLength(),
				s.currentValue(),
				preview,
				s.updatedAt()
		);
	}

}
