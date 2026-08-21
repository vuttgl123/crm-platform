import React, { useState, useEffect } from 'react';
import { teamApi, TenantSettingsData } from '@/services/api/teamApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import {
  Sliders,
  Building2,
  Shield,
  Save,
  Loader2,
  RefreshCw,
  Globe,
  ShieldCheck,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  FileCheck2,
  Clock,
  Lock,
  Share2,
  BellRing,
  MailCheck,
  Layers,
  Cpu,
  Users,
} from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettingsData | null>(null);
  const [initialSettings, setInitialSettings] = useState<TenantSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'localization' | 'security' | 'automation'>('profile');

  // Additional enterprise settings
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [notifySlack, setNotifySlack] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [fiscalYearStart, setFiscalYearStart] = useState('1');

  const fetchSettings = () => {
    setLoading(true);
    teamApi.getSettings().then((data) => {
      setSettings({ ...data });
      setInitialSettings({ ...data });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await teamApi.updateSettings(settings);
      setInitialSettings({ ...settings });
      toast.success('Organization & platform settings saved successfully!');
    } catch {
      toast.error('Unable to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-600">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Tenant &amp; Organization Settings"
        subtitle="Configure legal entity profile, currency localization, security governance &amp; workflow automation"
        icon={Sliders}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving || !hasChanges}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] disabled:bg-slate-200 disabled:text-slate-400 text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{hasChanges ? 'Save Settings *' : 'Saved'}</span>
            </Button>
          </>
        }
      />

      {/* Quick Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">License Tier</div>
            <div className="text-lg font-black text-slate-900 leading-tight">Enterprise</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Cpu className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Active Modules</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">12 / 12 Active</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Compliance Standard</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">ISO 27001</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Licensed Seats</div>
            <div className="text-lg font-black text-purple-700 leading-tight">35 Seats</div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-3 space-y-1 bg-white p-2 rounded-[4px] border border-slate-200 shadow-none">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition-colors text-left ${
              activeSection === 'profile'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeSection === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Legal Entity Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('localization')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition-colors text-left ${
              activeSection === 'localization'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeSection === 'localization' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Localization &amp; Currency</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition-colors text-left ${
              activeSection === 'security'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeSection === 'security' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Security &amp; Audit Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('automation')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-xs font-semibold transition-colors text-left ${
              activeSection === 'automation'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeSection === 'automation' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Lead Routing &amp; Automation</span>
          </button>
        </div>

        {/* Right Side: Section Content Card */}
        <div className="lg:col-span-9 space-y-4">
          {/* SECTION 1: Profile */}
          {activeSection === 'profile' && (
            <Card className="border border-slate-200 rounded-[4px] bg-white shadow-none overflow-hidden">
              <div className="p-4 bg-[#F7F8F9] border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Corporate Legal Profile</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Information rendered on Quotes, Contracts and B2B Invoices</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[3px]">
                  VERIFIED
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
                      value={settings.tenantName}
                      onChange={(e) => setSettings({ ...settings, tenantName: e.target.value })}
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
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
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
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Hotline / Customer Desk
                    </Label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
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
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="h-8.5 text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 2: Localization */}
          {activeSection === 'localization' && (
            <Card className="border border-slate-200 rounded-[4px] bg-white shadow-none overflow-hidden">
              <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Localization, Currency &amp; Timezone</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Primary currency, date presentation formatting and fiscal accounting periods</p>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Primary Commercial Currency</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(val) => setSettings({ ...settings, defaultCurrency: val })}
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
                      value={settings.defaultTimezone}
                      onValueChange={(val) => setSettings({ ...settings, defaultTimezone: val })}
                    >
                      <SelectTrigger className="h-8.5 text-xs font-mono bg-slate-50/60 border-slate-200 rounded-[3px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh (GMT+7)">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok (GMT+7)">Asia/Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore (GMT+8)">Asia/Singapore (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9)</SelectItem>
                        <SelectItem value="Europe/London (GMT+0)">Europe/London (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York (GMT-5)">America/New_York (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Fiscal Year Start Month</Label>
                    <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                      <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-[3px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January (Standard 01/01 - 31/12)</SelectItem>
                        <SelectItem value="4">April (01/04 - 31/03)</SelectItem>
                        <SelectItem value="7">July (01/07 - 30/06)</SelectItem>
                        <SelectItem value="10">October (01/10 - 30/09)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Datetime Formatting Display</Label>
                    <div className="p-2 rounded-[3px] bg-slate-50 border border-slate-200 flex items-center justify-between text-xs h-8.5">
                      <span className="font-mono text-slate-700">YYYY-MM-DD HH:mm:ss</span>
                      <Badge variant="outline" className="bg-white text-slate-600 text-[10px] rounded-[2px]">ISO-8601</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 3: Security */}
          {activeSection === 'security' && (
            <Card className="border border-slate-200 rounded-[4px] bg-white shadow-none overflow-hidden">
              <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Security, Audit &amp; Access Governance</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Two-factor authentication requirements, immutable audit logging &amp; idle timeout</p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                {/* 2FA Toggle */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Enforce Two-Factor Authentication (2FA / OTP)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Require Google Authenticator OTP for all Administrator &amp; privileged accounts.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, enableTwoFactor: !settings.enableTwoFactor })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      settings.enableTwoFactor ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.enableTwoFactor ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Audit Log Toggle */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Immutable Audit Logging</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Log 100% of authentications, record modifications and Excel export events into append-only log.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, enableAuditLog: !settings.enableAuditLog })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      settings.enableAuditLog ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.enableAuditLog ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Session Timeout */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Automatic Session Timeout</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Automatically lock user session after inactivity period.
                      </div>
                    </div>
                  </div>
                  <div className="w-36 shrink-0">
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="h-8 text-xs bg-slate-50/60 border-slate-200 rounded-[3px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* IP Whitelist */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Admin Portal IP Whitelisting</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Restrict administrator logins strictly to corporate VPN subnets.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIpWhitelistEnabled(!ipWhitelistEnabled)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      ipWhitelistEnabled ? 'bg-purple-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        ipWhitelistEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 4: Automation */}
          {activeSection === 'automation' && (
            <Card className="border border-slate-200 rounded-[4px] bg-white shadow-none overflow-hidden">
              <div className="p-4 bg-[#F7F8F9] border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lead Routing &amp; Notification Rules</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Inbound prospect assignment algorithms and digest report automation</p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                {/* Round Robin */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Round-Robin Lead Assignment</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Evenly distribute inbound web leads across active account executives in rotational sequence.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, autoAssignLeads: !settings.autoAssignLeads })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      settings.autoAssignLeads ? 'bg-purple-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.autoAssignLeads ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Slack Alert */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">High-Value Deal Alert</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Trigger real-time webhook notification upon receiving enterprise-tier opportunity inquiry.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifySlack(!notifySlack)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      notifySlack ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        notifySlack ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Daily Digest */}
                <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Daily Executive Summary Digest</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Aggregate day sales closed and dispatch summary report daily at 18:00.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDailyDigest(!dailyDigest)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      dailyDigest ? 'bg-amber-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        dailyDigest ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Bottom Save Bar */}
          <div className="p-3 bg-white border border-slate-200 rounded-[4px] shadow-none flex items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              {hasChanges ? (
                <span className="text-amber-600 font-bold">Unsaved changes detected</span>
              ) : (
                <span className="text-slate-500">Settings synchronized with server</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSettings}
                disabled={!hasChanges || isSaving}
                className="h-8 text-xs border-slate-200 rounded-[3px]"
              >
                Discard Changes
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={!hasChanges || isSaving}
                className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none px-3.5 rounded-[3px]"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSettingsPage;
