package com.crm.platform.settings.application.usecase;

import java.util.List;
import java.util.UUID;

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

public interface TenantSettingsFacade {

	ConsolidatedTenantSettingsDto getConsolidatedSettings();

	ConsolidatedTenantSettingsDto patchConsolidatedSettings(PatchConsolidatedSettingsCommand command);

	TenantProfileDto getProfile();

	TenantProfileDto updateProfile(UpdateTenantProfileCommand command);

	TenantProfileDto updateLogo(String logoUrl);

	TenantProfileDto resetLogo();

	BillingInfoDto getBillingInfo();

	BillingInfoDto updateBillingInfo(UpdateBillingInfoCommand command);

	LocalizationSettingsDto getLocalization();

	LocalizationSettingsDto updateLocalization(UpdateLocalizationCommand command);

	List<CurrencyRateDto> listCurrencies();

	CurrencyRateDto addCurrency(UpdateCurrencyRateCommand command);

	CurrencyRateDto updateCurrencyRate(String currencyCode, UpdateCurrencyRateCommand command);

	void deleteCurrency(String currencyCode);

	BusinessHoursDto getBusinessHours();

	BusinessHoursDto updateBusinessHours(UpdateBusinessHoursCommand command);

	SecuritySettingsDto getSecuritySettings();

	SecuritySettingsDto updateSecuritySettings(UpdateSecurityPolicyCommand command);

	List<IpWhitelistRuleDto> listIpWhitelistRules();

	IpWhitelistRuleDto addIpWhitelistRule(AddIpWhitelistRuleCommand command);

	void deleteIpWhitelistRule(UUID ruleId);

	List<ActiveSessionDto> listActiveSessions();

	void revokeAllSessions();

	void revokeSession(UUID sessionId);

	PasswordPolicyDto getPasswordPolicy();

	PasswordPolicyDto updatePasswordPolicy(UpdatePasswordPolicyCommand command);

	AutomationSettingsDto getAutomationSettings();

	AutomationSettingsDto updateAutomationSettings(UpdateAutomationRulesCommand command);

	List<LeadRoutingRuleDto> listLeadRoutingRules();

	LeadRoutingRuleDto addLeadRoutingRule(LeadRoutingRuleDto ruleDto);

	LeadRoutingRuleDto updateLeadRoutingRule(UUID ruleId, LeadRoutingRuleDto ruleDto);

	void deleteLeadRoutingRule(UUID ruleId);

	AlertRulesDto getAlertRules();

	AlertRulesDto updateAlertRules(UpdateAlertRulesCommand command);

	NotificationSettingsDto getNotificationSettings();

	NotificationSettingsDto updateNotificationSettings(UpdateNotificationGatewaysCommand command);

	boolean testNotificationPing(String channelType, String targetEndpoint);

	DigestScheduleDto getDigestSchedule();

	DigestScheduleDto updateDigestSchedule(UpdateDigestScheduleCommand command);

	List<DocumentSequenceDto> listDocumentSequences();

	DocumentSequenceDto getDocumentSequence(String entityType);

	DocumentSequenceDto updateDocumentSequence(String entityType, UpdateDocumentSequenceCommand command);

	DocumentSequenceDto resetDocumentSequence(String entityType, long newCounter);

	StorageUsageDto getStorageUsage();

	BackupSnapshotDto triggerBackup();

	List<BackupSnapshotDto> listBackupHistory();
}
