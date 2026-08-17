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
      toast.success('Đã lưu cấu hình tổ chức & hệ thống thành công!');
    } catch {
      toast.error('Không thể lưu cấu hình hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-600">Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header (100% Identical to AccountsPage) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Sliders className="w-4.5 h-4.5 text-white" />
            </div>
            Cấu hình Tổ chức &amp; Hệ thống (Tenant Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Thiết lập thông tin pháp nhân doanh nghiệp, múi giờ hệ thống, chính sách bảo mật và phân quyền tự động
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving || !hasChanges}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white gap-1.5 shadow-xs h-8 px-3.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{hasChanges ? 'Lưu Cấu Hình *' : 'Đã Lưu'}</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat KPI Cards (Standard 4-Column Responsive Grid) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Gói Bản Quyền</div>
            <div className="text-lg font-black text-slate-900 leading-tight">Enterprise</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Cpu className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Phân hệ Kích hoạt</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">12 / 12 Module</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Chuẩn An Toàn</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">ISO 27001</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tài khoản Quản trị</div>
            <div className="text-lg font-black text-purple-700 leading-tight">35 Active</div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Clean 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'profile'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeSection === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Thông tin Pháp nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('localization')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'localization'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeSection === 'localization' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Vận hành &amp; Tiền tệ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'security'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeSection === 'security' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Bảo mật &amp; Kiểm toán</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('automation')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'automation'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeSection === 'automation' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tự động hóa &amp; Quy tắc</span>
          </button>
        </div>

        {/* Right Side: Section Content Card */}
        <div className="lg:col-span-9 space-y-4">
          {/* ── SECTION 1: Profile ── */}
          {activeSection === 'profile' && (
            <Card className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hồ sơ Pháp nhân Doanh nghiệp</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Thông tin xuất hiện chính thức trên Báo giá, Hợp đồng và Đơn hàng B2B</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                  e-Invoice Verified
                </Badge>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Tên Doanh nghiệp / Tổ chức <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={settings.tenantName}
                      onChange={(e) => setSettings({ ...settings, tenantName: e.target.value })}
                      className="h-8.5 text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Mã số thuế doanh nghiệp (Tax Code)
                    </Label>
                    <Input
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                      className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email liên hệ đại diện
                    </Label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Hotline tổng đài / CSKH
                    </Label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Địa chỉ trụ sở chính đăng ký kinh doanh
                  </Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="h-8.5 text-xs bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* ── SECTION 2: Localization ── */}
          {activeSection === 'localization' && (
            <Card className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vận hành Khu vực, Tiền tệ &amp; Múi giờ</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Quy chuẩn đơn vị tiền tệ, định dạng số liệu báo cáo và chu kỳ kế toán</p>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Đơn vị tiền tệ chính (Primary Currency)</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(val) => setSettings({ ...settings, defaultCurrency: val })}
                    >
                      <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND (₫) - Đồng Việt Nam</SelectItem>
                        <SelectItem value="USD">USD ($) - Đô la Mỹ</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro Châu Âu</SelectItem>
                        <SelectItem value="JPY">JPY (¥) - Yên Nhật Bản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Múi giờ hệ thống (Timezone)</Label>
                    <Select
                      value={settings.defaultTimezone}
                      onValueChange={(val) => setSettings({ ...settings, defaultTimezone: val })}
                    >
                      <SelectTrigger className="h-8.5 text-xs font-mono bg-slate-50/60 border-slate-200 rounded-lg">
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
                    <Label className="text-xs font-semibold text-slate-700">Tháng bắt đầu Năm tài chính</Label>
                    <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                      <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tháng 1 (Tiêu chuẩn 01/01 - 31/12)</SelectItem>
                        <SelectItem value="4">Tháng 4 (Chuẩn Nhật Bản 01/04 - 31/03)</SelectItem>
                        <SelectItem value="7">Tháng 7 (Chuẩn Úc 01/07 - 30/06)</SelectItem>
                        <SelectItem value="10">Tháng 10 (Chuẩn Mỹ 01/10 - 30/09)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Định dạng hiển thị thời gian</Label>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs h-8.5">
                      <span className="font-mono text-slate-700">DD/MM/YYYY HH:mm:ss</span>
                      <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">Chuẩn VN</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── SECTION 3: Security ── */}
          {activeSection === 'security' && (
            <Card className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Chính sách Bảo mật, Kiểm toán &amp; Truy cập</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Quy chuẩn xác thực 2 bước, bảo vệ dữ liệu nhạy cảm và ngắt phiên tự động</p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                {/* 2FA Toggle */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Bắt buộc Xác thực Hai yếu tố (2FA / OTP)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Yêu cầu nhập OTP qua Google Authenticator đối với tất cả tài khoản Quản trị viên (Admin).
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
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Ghi nhật ký Kiểm toán Bất biến (Audit Logging)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Lưu vết 100% các hành động đăng nhập, sửa đổi bản ghi và xuất dữ liệu Excel.
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
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Tự động ngắt phiên (Session Timeout)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tự động khóa màn hình sau thời gian không có thao tác.
                      </div>
                    </div>
                  </div>
                  <div className="w-36 shrink-0">
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="h-8 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 phút</SelectItem>
                        <SelectItem value="30">30 phút</SelectItem>
                        <SelectItem value="60">60 phút</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* IP Whitelist */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Giới hạn IP truy cập cổng Quản trị (IP Whitelist)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Chỉ cho phép đăng nhập từ dải IP VPN nội bộ công ty.
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

          {/* ── SECTION 4: Automation ── */}
          {activeSection === 'automation' && (
            <Card className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quy tắc Phân bổ Leads &amp; Tự động hóa</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Thuật toán chia khách hàng tiềm năng và báo cáo tổng hợp tự động</p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                {/* Round Robin */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Phân bổ Leads tự động (Round-Robin Auto Assign)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Chia đều các Leads mới từ Website cho nhân viên kinh doanh theo vòng lặp luân phiên.
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
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Cảnh báo tức thời khi có Lead NÓNG (Hot Lead Alert)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Gửi thông báo Telegram / Slack ngay khi có Lead doanh nghiệp ngân sách lớn.
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
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Gửi Email Báo cáo Tổng kết Ngày (Daily Digest)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tổng hợp doanh thu chốt đơn và gửi email tổng quan vào lúc 18:00 hàng ngày.
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
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              {hasChanges ? (
                <span className="text-amber-600 font-bold">⚠️ Có thay đổi chưa lưu</span>
              ) : (
                <span className="text-slate-500">Cấu hình đang đồng bộ mới nhất</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSettings}
                disabled={!hasChanges || isSaving}
                className="h-8 text-xs border-slate-200"
              >
                Hủy thay đổi
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={!hasChanges || isSaving}
                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs px-3.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Lưu Cấu Hình</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
