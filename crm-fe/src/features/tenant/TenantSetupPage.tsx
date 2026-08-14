import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantApi, BootstrapTenantRequest } from '@/services/api/tenantApi';
import { authService } from '@/services';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';

export const TenantSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [legalName, setLegalName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('VND');
  const [countryCode, setCountryCode] = useState('VN');
  const [languageCode, setLanguageCode] = useState('vi');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug for tenantCode when displayName changes
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    if (!tenantCode || tenantCode === slugify(displayName)) {
      setTenantCode(slugify(val));
    }
    if (!legalName) {
      setLegalName(val);
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !tenantCode.trim() || !legalName.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    const payload: BootstrapTenantRequest = {
      tenantCode: tenantCode.trim().toLowerCase(),
      displayName: displayName.trim(),
      legalName: legalName.trim(),
      defaultCurrencyCode: currencyCode,
      defaultCountryCode: countryCode,
      defaultLanguageCode: languageCode,
      defaultTimezone: timezone,
    };

    try {
      const created = await tenantApi.bootstrap(payload);
      toast.success(`Khởi tạo tổ chức "${created.displayName}" thành công!`);

      // Refresh session to acquire the new tenant context & Tenant Admin role
      await authService.restoreSession();

      // Redirect to main overview dashboard
      window.location.href = '/app/overview';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo tổ chức thất bại';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-2 shadow-2xs">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>Thiết lập Tổ chức / Doanh nghiệp</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Chào mừng bạn đến với hệ thống CRM! Hãy khởi tạo tổ chức đầu tiên để kích hoạt đầy đủ quyền quản trị (Tenant Admin).
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Thông tin Khởi tạo Tổ chức mới</span>
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-1">
              Cấu hình thông tin pháp lý, đơn vị tiền tệ, múi giờ và quyền quản trị cao nhất cho tổ chức của bạn.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="dispName" className="text-xs font-semibold text-slate-700">
                    Tên Doanh nghiệp / Tổ chức *
                  </Label>
                  <Input
                    id="dispName"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    placeholder="Ví dụ: Công ty Cổ phần VUM CRM"
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tCode" className="text-xs font-semibold text-slate-700">
                    Mã Định danh Tổ chức (Slug ID) *
                  </Label>
                  <Input
                    id="tCode"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="vum-corp"
                    className="bg-white border-slate-200 text-blue-600 font-mono text-xs font-semibold"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Mã truy cập duy nhất (Ví dụ: vum-corp)</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lName" className="text-xs font-semibold text-slate-700">
                    Tên Pháp lý Đầy đủ *
                  </Label>
                  <Input
                    id="lName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Công ty Cổ phần VUM CRM..."
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="curr" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Đơn vị Tiền tệ Mặc định *
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: 'VND', label: 'VND (Việt Nam Đồng)', badge: '₫' },
                      { value: 'USD', label: 'USD (Đô la Mỹ)', badge: '$' },
                      { value: 'EUR', label: 'EUR (Euro)', badge: '€' },
                    ]}
                    value={currencyCode}
                    onValueChange={setCurrencyCode}
                    placeholder="Chọn đơn vị tiền tệ..."
                    searchPlaceholder="Tìm tiền tệ..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Quốc gia Mặc định *
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: 'VN', label: 'Việt Nam (VN)', badge: 'VN' },
                      { value: 'US', label: 'Hoa Kỳ (US)', badge: 'US' },
                      { value: 'JP', label: 'Nhật Bản (JP)', badge: 'JP' },
                      { value: 'SG', label: 'Singapore (SG)', badge: 'SG' },
                    ]}
                    value={countryCode}
                    onValueChange={setCountryCode}
                    placeholder="Chọn quốc gia..."
                    searchPlaceholder="Tìm quốc gia..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lang" className="text-xs font-semibold text-slate-700">
                    Ngôn ngữ Hệ thống
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: 'vi', label: 'Tiếng Việt (vi)', badge: 'VI' },
                      { value: 'en', label: 'English (en)', badge: 'EN' },
                    ]}
                    value={languageCode}
                    onValueChange={setLanguageCode}
                    placeholder="Chọn ngôn ngữ..."
                    searchPlaceholder="Tìm ngôn ngữ..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tz" className="text-xs font-semibold text-slate-700">
                    Múi giờ Khu vực
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (UTC+7)', badge: 'UTC+7' },
                      { value: 'UTC', label: 'UTC (Coordinated Universal Time)', badge: 'UTC' },
                    ]}
                    value={timezone}
                    onValueChange={setTimezone}
                    placeholder="Chọn múi giờ..."
                    searchPlaceholder="Tìm múi giờ..."
                  />
                </div>
              </div>

              {/* Feature Highlights Box */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 mt-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div className="font-bold text-blue-950">Quyền lợi sau khi khởi tạo thành công:</div>
                  <p>• Bạn nhận được vai trò **Tenant Admin** sở hữu toàn bộ quyền hạn cao nhất của tổ chức.</p>
                  <p>• Kích hoạt đầy đủ quyền **tạo, xem và quản lý dữ liệu Khách hàng (`crm_account.write`)**, Báo giá và Đơn hàng.</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-100 pt-4 pb-6 flex items-center justify-between bg-slate-50/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Đăng xuất / Quay lại
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo Tổ chức...</span>
                  </>
                ) : (
                  <>
                    <span>Khởi tạo Tổ chức & Bắt đầu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
