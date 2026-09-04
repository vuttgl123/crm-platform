import { apiFetch } from './apiClient';

export interface TenantProfileData {
  tenantName: string;
  legalName: string;
  taxCode: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  logoUrl: string | null;
}

export interface BillingInfoData {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  swiftCode: string;
  invoiceHeaderNote: string;
  invoiceFooterNote: string;
}

export interface LocalizationData {
  defaultCurrency: string;
  supportedCurrencies: string[];
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  fiscalYearStartMonth: number;
}

export interface CurrencyRateData {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  exchangeRateToBase: number;
  rateMode: 'MANUAL' | 'AUTO_SYNC';
  lastSyncedAt?: string;
}

export interface BusinessHoursData {
  timezone: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  holidayCalendarEnabled: boolean;
  observedHolidays: string[];
}

export interface SecuritySettingsData {
  enableTwoFactor: boolean;
  twoFactorEnforceScope: 'ALL_USERS' | 'ADMINS_ONLY' | 'OPTIONAL';
  enableAuditLog: boolean;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  ipWhitelistEnabled: boolean;
  passwordExpiryDays: number;
}

export interface PasswordPolicyData {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  passwordHistoryCount: number;
}

export interface IpWhitelistRuleData {
  id: string;
  cidrBlock: string;
  description: string;
  active: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface ActiveSessionData {
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  loginAt: string;
  lastActivityAt: string;
  isCurrentSession: boolean;
}

export interface AutomationSettingsData {
  autoAssignLeads: boolean;
  routingStrategy: 'ROUND_ROBIN' | 'WEIGHTED_CAPACITY' | 'TERRITORY' | 'MANUAL';
  defaultLeadOwnerUserId?: string | null;
  defaultLeadOwnerTeamId?: string | null;
  notifySlack: boolean;
  dailyDigest: boolean;
  digestTime: string;
  autoTaskCreationOnNewLead: boolean;
  staleDealThresholdDays: number;
}

export interface LeadRoutingRuleData {
  id?: string;
  ruleName: string;
  priority: number;
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  assignToUserId?: string | null;
  assignToTeamId?: string | null;
  active: boolean;
}

export interface AlertRulesData {
  highValueDealAlertEnabled: boolean;
  highValueDealThreshold: number;
  highValueNotificationChannels: string[];
  staleDealAlertEnabled: boolean;
  staleDealInactivityDays: number;
  churnRiskAlertEnabled: boolean;
}

export interface NotificationSettingsData {
  customSmtpEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSenderEmail?: string;
  smtpSenderName?: string;
  slackWebhookEnabled: boolean;
  slackWebhookUrl?: string;
  slackChannel?: string;
  teamsWebhookEnabled: boolean;
  teamsWebhookUrl?: string;
  inAppNotificationsEnabled: boolean;
}

export interface DigestScheduleData {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY_MONDAY' | 'WEEKLY_FRIDAY';
  deliveryTime: string;
  timezone: string;
  recipientUserIds: string[];
  recipientEmails: string[];
  includedMetricKeys: string[];
}

export interface DocumentSequenceData {
  entityType: string;
  prefix: string;
  dateFormatPattern: string;
  paddingLength: number;
  currentValue: number;
  previewFormattedNumber: string;
  updatedAt: string;
}

export interface StorageUsageData {
  databaseSizeBytes: number;
  attachmentsSizeBytes: number;
  totalAllocatedQuotaBytes: number;
  usagePercentage: number;
  totalDbRows: number;
  storageBreakdownByModule: Record<string, number>;
}

export interface BackupSnapshotData {
  backupId: string;
  backupFileName: string;
  fileSizeBytes: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  createdAt: string;
  expiresAt: string;
  downloadUrl: string;
}

export interface ConsolidatedTenantSettingsData {
  tenantId: string;
  tenantCode: string;
  profile: TenantProfileData;
  billingInfo: BillingInfoData;
  localization: LocalizationData;
  businessHours: BusinessHoursData;
  security: SecuritySettingsData;
  passwordPolicy: PasswordPolicyData;
  automation: AutomationSettingsData;
  alertRules: AlertRulesData;
  notifications: NotificationSettingsData;
  digest: DigestScheduleData;
  version: number;
  updatedAt: string;
}

export const tenantSettingsApi = {
  // 1. Consolidated
  getConsolidatedSettings: async (): Promise<ConsolidatedTenantSettingsData> => {
    return apiFetch<ConsolidatedTenantSettingsData>('/platform/settings');
  },

  patchConsolidatedSettings: async (
    data: Partial<ConsolidatedTenantSettingsData>
  ): Promise<ConsolidatedTenantSettingsData> => {
    return apiFetch<ConsolidatedTenantSettingsData>('/platform/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 2. Profile
  getProfile: async (): Promise<TenantProfileData> => {
    return apiFetch<TenantProfileData>('/platform/settings/profile');
  },

  updateProfile: async (data: Partial<TenantProfileData>): Promise<TenantProfileData> => {
    return apiFetch<TenantProfileData>('/platform/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateLogo: async (logoUrl: string): Promise<TenantProfileData> => {
    return apiFetch<TenantProfileData>(`/platform/settings/profile/logo?logoUrl=${encodeURIComponent(logoUrl)}`, {
      method: 'POST',
    });
  },

  resetLogo: async (): Promise<TenantProfileData> => {
    return apiFetch<TenantProfileData>('/platform/settings/profile/logo', {
      method: 'DELETE',
    });
  },

  getBillingInfo: async (): Promise<BillingInfoData> => {
    return apiFetch<BillingInfoData>('/platform/settings/profile/billing-info');
  },

  updateBillingInfo: async (data: Partial<BillingInfoData>): Promise<BillingInfoData> => {
    return apiFetch<BillingInfoData>('/platform/settings/profile/billing-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Localization
  getLocalization: async (): Promise<LocalizationData> => {
    return apiFetch<LocalizationData>('/platform/settings/localization');
  },

  updateLocalization: async (data: Partial<LocalizationData>): Promise<LocalizationData> => {
    return apiFetch<LocalizationData>('/platform/settings/localization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  listCurrencies: async (): Promise<CurrencyRateData[]> => {
    return apiFetch<CurrencyRateData[]>('/platform/settings/currencies');
  },

  addCurrency: async (data: CurrencyRateData): Promise<CurrencyRateData> => {
    return apiFetch<CurrencyRateData>('/platform/settings/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCurrencyRate: async (code: string, data: Partial<CurrencyRateData>): Promise<CurrencyRateData> => {
    return apiFetch<CurrencyRateData>(`/platform/settings/currencies/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCurrency: async (code: string): Promise<void> => {
    return apiFetch<void>(`/platform/settings/currencies/${code}`, {
      method: 'DELETE',
    });
  },

  getBusinessHours: async (): Promise<BusinessHoursData> => {
    return apiFetch<BusinessHoursData>('/platform/settings/business-hours');
  },

  updateBusinessHours: async (data: Partial<BusinessHoursData>): Promise<BusinessHoursData> => {
    return apiFetch<BusinessHoursData>('/platform/settings/business-hours', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 4. Security
  getSecuritySettings: async (): Promise<SecuritySettingsData> => {
    return apiFetch<SecuritySettingsData>('/platform/settings/security');
  },

  updateSecuritySettings: async (data: Partial<SecuritySettingsData>): Promise<SecuritySettingsData> => {
    return apiFetch<SecuritySettingsData>('/platform/settings/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  listIpWhitelist: async (): Promise<IpWhitelistRuleData[]> => {
    return apiFetch<IpWhitelistRuleData[]>('/platform/settings/security/ip-whitelist');
  },

  addIpWhitelist: async (data: { cidrBlock: string; description: string }): Promise<IpWhitelistRuleData> => {
    return apiFetch<IpWhitelistRuleData>('/platform/settings/security/ip-whitelist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteIpWhitelist: async (ruleId: string): Promise<void> => {
    return apiFetch<void>(`/platform/settings/security/ip-whitelist/${ruleId}`, {
      method: 'DELETE',
    });
  },

  listActiveSessions: async (): Promise<ActiveSessionData[]> => {
    return apiFetch<ActiveSessionData[]>('/platform/settings/security/active-sessions');
  },

  revokeAllSessions: async (): Promise<void> => {
    return apiFetch<void>('/platform/settings/security/sessions/revoke-all', {
      method: 'POST',
    });
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    return apiFetch<void>(`/platform/settings/security/sessions/${sessionId}/revoke`, {
      method: 'POST',
    });
  },

  getPasswordPolicy: async (): Promise<PasswordPolicyData> => {
    return apiFetch<PasswordPolicyData>('/platform/settings/security/password-policy');
  },

  updatePasswordPolicy: async (data: Partial<PasswordPolicyData>): Promise<PasswordPolicyData> => {
    return apiFetch<PasswordPolicyData>('/platform/settings/security/password-policy', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 5. Automation
  getLeadRouting: async (): Promise<AutomationSettingsData> => {
    return apiFetch<AutomationSettingsData>('/platform/settings/automation/lead-routing');
  },

  updateLeadRouting: async (data: Partial<AutomationSettingsData>): Promise<AutomationSettingsData> => {
    return apiFetch<AutomationSettingsData>('/platform/settings/automation/lead-routing', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  listLeadRoutingRules: async (): Promise<LeadRoutingRuleData[]> => {
    return apiFetch<LeadRoutingRuleData[]>('/platform/settings/automation/lead-routing/rules');
  },

  addLeadRoutingRule: async (data: LeadRoutingRuleData): Promise<LeadRoutingRuleData> => {
    return apiFetch<LeadRoutingRuleData>('/platform/settings/automation/lead-routing/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLeadRoutingRule: async (ruleId: string, data: LeadRoutingRuleData): Promise<LeadRoutingRuleData> => {
    return apiFetch<LeadRoutingRuleData>(`/platform/settings/automation/lead-routing/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLeadRoutingRule: async (ruleId: string): Promise<void> => {
    return apiFetch<void>(`/platform/settings/automation/lead-routing/rules/${ruleId}`, {
      method: 'DELETE',
    });
  },

  getAlertRules: async (): Promise<AlertRulesData> => {
    return apiFetch<AlertRulesData>('/platform/settings/automation/alert-rules');
  },

  updateAlertRules: async (data: Partial<AlertRulesData>): Promise<AlertRulesData> => {
    return apiFetch<AlertRulesData>('/platform/settings/automation/alert-rules', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 6. Notifications
  getNotifications: async (): Promise<NotificationSettingsData> => {
    return apiFetch<NotificationSettingsData>('/platform/settings/notifications');
  },

  updateNotifications: async (data: Partial<NotificationSettingsData>): Promise<NotificationSettingsData> => {
    return apiFetch<NotificationSettingsData>('/platform/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  testNotificationPing: async (channelType: string, targetEndpoint: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>('/platform/settings/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ channelType, targetEndpoint }),
    });
  },

  getDigestSchedule: async (): Promise<DigestScheduleData> => {
    return apiFetch<DigestScheduleData>('/platform/settings/notifications/digest');
  },

  updateDigestSchedule: async (data: Partial<DigestScheduleData>): Promise<DigestScheduleData> => {
    return apiFetch<DigestScheduleData>('/platform/settings/notifications/digest', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 7. Document Sequences
  listDocumentSequences: async (): Promise<DocumentSequenceData[]> => {
    return apiFetch<DocumentSequenceData[]>('/platform/settings/document-sequences');
  },

  getDocumentSequence: async (entityType: string): Promise<DocumentSequenceData> => {
    return apiFetch<DocumentSequenceData>(`/platform/settings/document-sequences/${entityType}`);
  },

  updateDocumentSequence: async (
    entityType: string,
    data: { prefix: string; dateFormatPattern: string; paddingLength: number }
  ): Promise<DocumentSequenceData> => {
    return apiFetch<DocumentSequenceData>(`/platform/settings/document-sequences/${entityType}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  resetDocumentSequence: async (entityType: string, newCounter: number): Promise<DocumentSequenceData> => {
    return apiFetch<DocumentSequenceData>(`/platform/settings/document-sequences/${entityType}/reset`, {
      method: 'POST',
      body: JSON.stringify({ newCounter }),
    });
  },

  // 8. Storage & Backup
  getStorageUsage: async (): Promise<StorageUsageData> => {
    return apiFetch<StorageUsageData>('/platform/settings/storage/usage');
  },

  triggerBackup: async (): Promise<BackupSnapshotData> => {
    return apiFetch<BackupSnapshotData>('/platform/settings/backup/trigger', {
      method: 'POST',
    });
  },

  listBackupHistory: async (): Promise<BackupSnapshotData[]> => {
    return apiFetch<BackupSnapshotData[]>('/platform/settings/backup/history');
  },
};
