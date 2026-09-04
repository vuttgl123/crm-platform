import React, { useState, useEffect } from 'react';
import {
  tenantSettingsApi,
  ConsolidatedTenantSettingsData,
  IpWhitelistRuleData,
  LeadRoutingRuleData,
  DocumentSequenceData,
  BackupSnapshotData,
  CurrencyRateData,
} from '@/services/api/tenantSettingsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardGlidingTabs, TabItem } from '@/components/common/StandardGlidingTabs';
import {
  Building2,
  Shield,
  Save,
  Loader2,
  RotateCcw,
  Globe,
  ShieldCheck,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  FileCheck2,
  Lock,
  BellRing,
  MailCheck,
  Layers,
  Cpu,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Database,
  Hash,
  Send,
  Download,
} from 'lucide-react';

type SettingsTab =
  | 'profile'
  | 'localization'
  | 'security'
  | 'automation'
  | 'notifications'
  | 'sequences'
  | 'storage';

export const TenantSettingsPage: React.FC = () => {
  const [data, setData] = useState<ConsolidatedTenantSettingsData | null>(null);
  const [initialData, setInitialData] = useState<ConsolidatedTenantSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Sub-items states
  const [ipRules, setIpRules] = useState<IpWhitelistRuleData[]>([]);
  const [newCidr, setNewCidr] = useState('');
  const [newCidrDesc, setNewCidrDesc] = useState('');

  const [currencies, setCurrencies] = useState<CurrencyRateData[]>([]);
  const [newCurrencyCode, setNewCurrencyCode] = useState('');
  const [newCurrencyRate, setNewCurrencyRate] = useState('25000');

  const [routingRules, setRoutingRules] = useState<LeadRoutingRuleData[]>([]);
  const [sequences, setSequences] = useState<DocumentSequenceData[]>([]);
  const [backups, setBackups] = useState<BackupSnapshotData[]>([]);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);
  const [pingTesting, setPingTesting] = useState(false);

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const consolidated = await tenantSettingsApi.getConsolidatedSettings();
      setData(consolidated);
      setInitialData(JSON.parse(JSON.stringify(consolidated)));

      // Load supporting lists
      const [ipList, currList, rulesList, seqList, bkpList] = await Promise.allSettled([
        tenantSettingsApi.listIpWhitelist(),
        tenantSettingsApi.listCurrencies(),
        tenantSettingsApi.listLeadRoutingRules(),
        tenantSettingsApi.listDocumentSequences(),
        tenantSettingsApi.listBackupHistory(),
      ]);

      if (ipList.status === 'fulfilled') setIpRules(ipList.value);
      if (currList.status === 'fulfilled') setCurrencies(currList.value);
      if (rulesList.status === 'fulfilled') setRoutingRules(rulesList.value);
      if (seqList.status === 'fulfilled') setSequences(seqList.value);
      if (bkpList.status === 'fulfilled') setBackups(bkpList.value);
    } catch {
      toast.error('Unable to retrieve consolidated platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    try {
      const updated = await tenantSettingsApi.patchConsolidatedSettings(data);
      setData(updated);
      setInitialData(JSON.parse(JSON.stringify(updated)));
      toast.success('Organization & platform settings saved successfully!');
    } catch {
      toast.error('Unable to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddIpRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr.trim()) return;
    try {
      const created = await tenantSettingsApi.addIpWhitelist({
        cidrBlock: newCidr.trim(),
        description: newCidrDesc.trim() || 'Corporate Subnet',
      });
      setIpRules([created, ...ipRules]);
      setNewCidr('');
      setNewCidrDesc('');
      toast.success('IP whitelist rule added successfully');
    } catch {
      toast.error('Failed to add IP whitelist rule');
    }
  };

  const handleDeleteIpRule = async (id: string) => {
    try {
      await tenantSettingsApi.deleteIpWhitelist(id);
      setIpRules(ipRules.filter((r) => r.id !== id));
      toast.success('IP whitelist rule removed');
    } catch {
      toast.error('Failed to remove IP whitelist rule');
    }
  };

  const handleAddCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrencyCode.trim()) return;
    try {
      const created = await tenantSettingsApi.addCurrency({
        currencyCode: newCurrencyCode.toUpperCase().trim(),
        currencyName: newCurrencyCode.toUpperCase().trim(),
        symbol: newCurrencyCode.toUpperCase().trim(),
        exchangeRateToBase: parseFloat(newCurrencyRate) || 1,
        rateMode: 'MANUAL',
      });
      setCurrencies([...currencies.filter((c) => c.currencyCode !== created.currencyCode), created]);
      setNewCurrencyCode('');
      toast.success(`Currency ${created.currencyCode} added`);
    } catch {
      toast.error('Failed to add currency');
    }
  };

  const handleTriggerBackup = async () => {
    setIsTriggeringBackup(true);
    try {
      const snap = await tenantSettingsApi.triggerBackup();
      setBackups([snap, ...backups]);
      toast.success('Instant tenant data snapshot completed!');
    } catch {
      toast.error('Failed to generate backup');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const handlePingTest = async (channel: string, target: string) => {
    setPingTesting(true);
    try {
      await tenantSettingsApi.testNotificationPing(channel, target);
      toast.success(`Notification ping sent to ${channel} successfully!`);
    } catch {
      toast.error('Ping test failed');
    } finally {
      setPingTesting(false);
    }
  };

  const tabs: TabItem<SettingsTab>[] = [
    { id: 'profile', label: 'Legal Entity Profile', icon: Building2 },
    { id: 'localization', label: 'Localization & Currency', icon: Globe },
    { id: 'security', label: 'Security & Governance', icon: Shield },
    { id: 'automation', label: 'Routing & Automation', icon: Sparkles },
    { id: 'notifications', label: 'Notification Gateways', icon: BellRing },
    { id: 'sequences', label: 'Document Numbering', icon: Hash },
    { id: 'storage', label: 'Storage & Backup', icon: Database },
  ];

  if (loading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-[#0C66E4]" />
        <span className="text-xs font-semibold text-slate-600">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Tenant & Organization Settings"
        subtitle="Configure legal entity corporate profile, currency localization, security governance, lead routing & document sequences."
        badgeLabel="subsystems"
        badgeCount={7}
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Reload saved settings">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllSettings}
                disabled={loading}
                className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </ActionTooltip>

            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving || !hasChanges}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] disabled:bg-slate-100 disabled:text-slate-400 text-white gap-1.5 shadow-2xs h-8 rounded-[3px]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{hasChanges ? 'Save Settings *' : 'Saved'}</span>
            </Button>
          </div>
        }
      />

      {/* Quick Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5 text-[#0C66E4]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">License Tier</div>
            <div className="text-base font-black text-slate-900 leading-tight">Enterprise Scale</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <Cpu className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Active Subsystems</div>
            <div className="text-base font-black text-indigo-700 leading-tight">28 Endpoints Online</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Compliance Standard</div>
            <div className="text-base font-black text-emerald-700 leading-tight">ISO 27001 · GDPR</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Licensed Seats</div>
            <div className="text-base font-black text-purple-700 leading-tight">Unlimited Dedicated</div>
          </div>
        </div>
      </div>

      {/* Standard Gliding Tabs Bar */}
      <StandardGlidingTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Main Tab Content Card */}
      <div className="space-y-4">
        {/* TAB 1: Profile */}
        {activeTab === 'profile' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Corporate Legal Profile</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Information rendered on Quotes, Contracts and B2B Invoices</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]">
                VERIFIED TENANT
              </Badge>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Legal Enterprise Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={data.profile.tenantName}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, tenantName: e.target.value },
                      })
                    }
                    className="h-8.5 text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Tax Identification Number (TIN)
                  </Label>
                  <Input
                    value={data.profile.taxCode}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, taxCode: e.target.value },
                      })
                    }
                    className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Corporate Contact Email
                  </Label>
                  <Input
                    type="email"
                    value={data.profile.contactEmail}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, contactEmail: e.target.value },
                      })
                    }
                    className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Hotline / Customer Desk
                  </Label>
                  <Input
                    value={data.profile.contactPhone}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, contactPhone: e.target.value },
                      })
                    }
                    className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Headquarters Registered Address
                </Label>
                <Input
                  value={data.profile.address}
                  onChange={(e) =>
                    setData({
                      ...data,
                      profile: { ...data.profile, address: e.target.value },
                    })
                  }
                  className="h-8.5 text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                />
              </div>

              {/* Billing Info Sub-Card */}
              <div className="p-4 rounded-[4px] border border-slate-200 bg-slate-50/60 space-y-3 mt-4">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Banking & Invoicing Instructions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Bank Name</Label>
                    <Input
                      value={data.billingInfo?.bankName || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          billingInfo: { ...data.billingInfo, bankName: e.target.value },
                        })
                      }
                      className="h-7.5 text-xs bg-white border-slate-200 rounded-[3px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Account Number</Label>
                    <Input
                      value={data.billingInfo?.bankAccountNumber || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          billingInfo: { ...data.billingInfo, bankAccountNumber: e.target.value },
                        })
                      }
                      className="h-7.5 text-xs font-mono bg-white border-slate-200 rounded-[3px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Swift / Bin Code</Label>
                    <Input
                      value={data.billingInfo?.swiftCode || ''}
                      onChange={(e) =>
                        setData({
                          ...data,
                          billingInfo: { ...data.billingInfo, swiftCode: e.target.value },
                        })
                      }
                      className="h-7.5 text-xs font-mono bg-white border-slate-200 rounded-[3px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Localization */}
        {activeTab === 'localization' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Localization & Multi-Currency</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Primary currency, date presentation formatting and fiscal accounting periods</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Primary Commercial Currency</Label>
                  <Select
                    value={data.localization.defaultCurrency}
                    onValueChange={(val) =>
                      setData({
                        ...data,
                        localization: { ...data.localization, defaultCurrency: val },
                      })
                    }
                  >
                    <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-[3px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫) - Vietnam Dong</SelectItem>
                      <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                      <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">System Timezone</Label>
                  <Select
                    value={data.localization.defaultTimezone}
                    onValueChange={(val) =>
                      setData({
                        ...data,
                        localization: { ...data.localization, defaultTimezone: val },
                      })
                    }
                  >
                    <SelectTrigger className="h-8.5 text-xs font-mono bg-slate-50/60 border-slate-200 rounded-[3px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multi Currencies Table */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Supported Multi-Currencies & Exchange Rates</span>
                </div>
                <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2">Currency</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Rate to Base ({data.localization.defaultCurrency})</th>
                        <th className="p-2">Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currencies.map((c) => (
                        <tr key={c.currencyCode} className="hover:bg-slate-50/50">
                          <td className="p-2 font-mono font-bold text-slate-800">{c.currencyCode}</td>
                          <td className="p-2 text-slate-600">{c.currencyName}</td>
                          <td className="p-2 font-mono">{c.symbol}</td>
                          <td className="p-2 font-mono text-indigo-700">{c.exchangeRateToBase.toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-[10px] rounded-[2px]">
                              {c.rateMode}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={handleAddCurrency} className="flex items-center gap-2 pt-2">
                  <Input
                    placeholder="Currency Code (e.g. SGD)"
                    value={newCurrencyCode}
                    onChange={(e) => setNewCurrencyCode(e.target.value)}
                    className="h-8 text-xs font-mono max-w-40 rounded-[3px]"
                  />
                  <Input
                    placeholder="Rate"
                    value={newCurrencyRate}
                    onChange={(e) => setNewCurrencyRate(e.target.value)}
                    className="h-8 text-xs font-mono max-w-32 rounded-[3px]"
                  />
                  <Button size="sm" type="submit" className="h-8 text-xs bg-[#0C66E4] rounded-[3px] gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Currency
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Security */}
        {activeTab === 'security' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Security & Access Governance</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Two-factor authentication, session limits, IP whitelisting & password policy</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* 2FA Toggle */}
              <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-[3px] bg-blue-50 text-[#0C66E4] flex items-center justify-center shrink-0 border border-blue-200">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Enforce Two-Factor Authentication (2FA / OTP)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require Google Authenticator OTP for all Administrator & privileged accounts.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      security: { ...data.security, enableTwoFactor: !data.security.enableTwoFactor },
                    })
                  }
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    data.security.enableTwoFactor ? 'bg-[#0C66E4]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      data.security.enableTwoFactor ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* IP Whitelisting Sub-Module */}
              <div className="p-4 rounded-[4px] border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Admin Portal IP Whitelist Rules
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] rounded-[2px]">
                    {ipRules.length} Active Rules
                  </Badge>
                </div>

                <div className="space-y-2">
                  {ipRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-[3px] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{rule.cidrBlock}</span>
                        <span className="text-slate-500">· {rule.description}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIpRule(rule.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-[3px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddIpRule} className="flex items-center gap-2 pt-2">
                  <Input
                    placeholder="CIDR Block (e.g. 14.232.208.0/24)"
                    value={newCidr}
                    onChange={(e) => setNewCidr(e.target.value)}
                    className="h-8 text-xs font-mono max-w-48 bg-white rounded-[3px]"
                  />
                  <Input
                    placeholder="Description / Location"
                    value={newCidrDesc}
                    onChange={(e) => setNewCidrDesc(e.target.value)}
                    className="h-8 text-xs bg-white rounded-[3px]"
                  />
                  <Button size="sm" type="submit" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 rounded-[3px] gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add IP Rule
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Automation */}
        {activeTab === 'automation' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lead Routing & Automation Rules</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Inbound lead assignment algorithms and automated high-value deal alerts</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Lead Assignment Strategy</Label>
                  <Select
                    value={data.automation.routingStrategy}
                    onValueChange={(val: any) =>
                      setData({
                        ...data,
                        automation: { ...data.automation, routingStrategy: val },
                      })
                    }
                  >
                    <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-[3px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUND_ROBIN">Round-Robin (Even Distribution)</SelectItem>
                      <SelectItem value="WEIGHTED_CAPACITY">Weighted by Sales Rep Capacity</SelectItem>
                      <SelectItem value="TERRITORY">Territory / Geographic Region</SelectItem>
                      <SelectItem value="MANUAL">Manual Triage & Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Stale Deal Inactivity Alert (Days)</Label>
                  <Input
                    type="number"
                    value={data.automation.staleDealThresholdDays}
                    onChange={(e) =>
                      setData({
                        ...data,
                        automation: { ...data.automation, staleDealThresholdDays: parseInt(e.target.value) || 14 },
                      })
                    }
                    className="h-8.5 text-xs font-mono bg-slate-50/60 border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>

              {/* Lead Routing Rules List */}
              <div className="pt-2 space-y-2">
                <div className="font-bold text-slate-800">Conditional Lead Assignment Rules</div>
                <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2">Rule Name</th>
                        <th className="p-2">Priority</th>
                        <th className="p-2">Condition</th>
                        <th className="p-2">Operator</th>
                        <th className="p-2">Value</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {routingRules.map((r) => (
                        <tr key={r.ruleName} className="hover:bg-slate-50/50">
                          <td className="p-2 font-semibold text-slate-800">{r.ruleName}</td>
                          <td className="p-2 font-mono">#{r.priority}</td>
                          <td className="p-2 font-mono text-slate-600">{r.conditionField}</td>
                          <td className="p-2 font-mono text-indigo-600">{r.conditionOperator}</td>
                          <td className="p-2 font-mono">{r.conditionValue}</td>
                          <td className="p-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-[2px]">
                              ACTIVE
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Notifications */}
        {activeTab === 'notifications' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notification Gateways & Scheduled Digest</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Slack webhook connectors, SMTP mail delivery and daily executive summary dispatch</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Slack Webhook URL</Label>
                  <Input
                    value={data.notifications.slackWebhookUrl || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        notifications: { ...data.notifications, slackWebhookUrl: e.target.value },
                      })
                    }
                    placeholder="https://hooks.slack.com/services/..."
                    className="h-8.5 text-xs font-mono bg-slate-50/60 border-slate-200 rounded-[3px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Slack Channel Tag</Label>
                  <Input
                    value={data.notifications.slackChannel || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        notifications: { ...data.notifications, slackChannel: e.target.value },
                      })
                    }
                    placeholder="#crm-alerts"
                    className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pingTesting}
                  onClick={() => handlePingTest('SLACK', data.notifications.slackWebhookUrl || 'https://hooks.slack.com')}
                  className="h-8 text-xs gap-1.5 rounded-[3px]"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" /> Ping Slack Webhook
                </Button>
              </div>

              {/* Daily Digest schedule */}
              <div className="p-4 rounded-[4px] border border-slate-200 bg-amber-50/30 space-y-2 mt-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MailCheck className="w-4 h-4 text-amber-600" />
                  Executive Summary Digest Schedule
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Dispatch Time</Label>
                    <Input
                      value={data.digest.deliveryTime}
                      onChange={(e) =>
                        setData({
                          ...data,
                          digest: { ...data.digest, deliveryTime: e.target.value },
                        })
                      }
                      className="h-7.5 text-xs font-mono bg-white rounded-[3px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Frequency</Label>
                    <Select
                      value={data.digest.frequency}
                      onValueChange={(val: any) =>
                        setData({
                          ...data,
                          digest: { ...data.digest, frequency: val },
                        })
                      }
                    >
                      <SelectTrigger className="h-7.5 text-xs bg-white rounded-[3px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily (18:00)</SelectItem>
                        <SelectItem value="WEEKLY_MONDAY">Weekly on Monday</SelectItem>
                        <SelectItem value="WEEKLY_FRIDAY">Weekly on Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Document Sequences */}
        {activeTab === 'sequences' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Document Numbering Schemes & Sequences</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Custom prefix, date token and zero-padded counters for CRM documents</p>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2">Entity</th>
                      <th className="p-2">Prefix</th>
                      <th className="p-2">Date Format</th>
                      <th className="p-2">Padding</th>
                      <th className="p-2">Current Value</th>
                      <th className="p-2">Next Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sequences.map((seq) => (
                      <tr key={seq.entityType} className="hover:bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-800">{seq.entityType}</td>
                        <td className="p-2 font-mono text-indigo-600">{seq.prefix}</td>
                        <td className="p-2 font-mono text-slate-600">{seq.dateFormatPattern}</td>
                        <td className="p-2 font-mono">{seq.paddingLength} digits</td>
                        <td className="p-2 font-mono text-slate-900">{seq.currentValue}</td>
                        <td className="p-2">
                          <Badge className="bg-blue-50 text-[#0C66E4] border-blue-200 font-mono text-[10px] rounded-[2px]">
                            {seq.previewFormattedNumber}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Storage & Backup */}
        {activeTab === 'storage' && (
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F8F9] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tenant Storage Quota & Backups</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Database storage allocation metrics, attachment usage and on-demand snapshots</p>
              </div>
              <Button
                size="sm"
                onClick={handleTriggerBackup}
                disabled={isTriggeringBackup}
                className="h-8 text-xs bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 rounded-[3px]"
              >
                {isTriggeringBackup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Instant Snapshot Export
              </Button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Database Allocated</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">185 MB / 10.0 GB</div>
                  <div className="text-[10px] text-emerald-600 mt-1">1.72% quota utilized</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Attachments & Media</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">145 MB</div>
                  <div className="text-[10px] text-slate-500 mt-1">3,420 files stored</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Total Database Records</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">14,250 Rows</div>
                  <div className="text-[10px] text-indigo-600 mt-1">Optimal indexing health</div>
                </div>
              </div>

              {/* Backup Snapshots list */}
              <div className="pt-2 space-y-2">
                <div className="font-bold text-slate-800">Snapshot Backup History</div>
                <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2">Archive Name</th>
                        <th className="p-2">Size</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Timestamp</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {backups.map((b) => (
                        <tr key={b.backupId} className="hover:bg-slate-50/50">
                          <td className="p-2 font-mono font-semibold text-slate-800">{b.backupFileName}</td>
                          <td className="p-2 font-mono text-slate-600">{(b.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</td>
                          <td className="p-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-[2px]">
                              {b.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-500 font-mono">{b.createdAt}</td>
                          <td className="p-2">
                            <a
                              href={b.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0C66E4] hover:underline font-semibold"
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-3 bg-white border border-slate-200 rounded-[4px] shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            {hasChanges ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-700 font-bold">Unsaved changes detected across settings</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600">Settings synchronized with cloud</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllSettings}
              disabled={!hasChanges || isSaving}
              className="h-8 text-xs border-slate-200 rounded-[3px]"
            >
              Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={!hasChanges || isSaving}
              className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-2xs px-3.5 rounded-[3px]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSettingsPage;
