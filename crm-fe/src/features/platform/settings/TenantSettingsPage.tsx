import React, { useState, useEffect } from 'react';
import { mockPlatformApi, TenantSettingsData } from '@/services/mock/mockPlatformData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Settings2,
  Building,
  Shield,
  Save,
  Loader2,
} from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    mockPlatformApi.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await mockPlatformApi.updateSettings(settings);
      toast.success('Đã lưu cấu hình tổ chức thành công!');
    } catch {
      toast.error('Không thể lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Settings2 className="w-7 h-7 text-blue-600" />
          <span>Cấu hình Tổ chức & Hệ thống (Tenant Settings)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập thông tin pháp nhân doanh nghiệp, múi giờ hệ thống và các chính sách bảo mật vận hành
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Thông tin Pháp nhân Doanh nghiệp</CardTitle>
                <CardDescription className="text-xs text-slate-500">Tên công ty xuất hiện trên hợp đồng và báo giá</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Tên Doanh nghiệp / Tổ chức *</Label>
                <Input
                  value={settings.tenantName}
                  onChange={(e) => setSettings({ ...settings, tenantName: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Mã số thuế doanh nghiệp</Label>
                <Input
                  value={settings.taxCode}
                  onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Email liên hệ đại diện</Label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Hotline tổng đài</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Địa chỉ trụ sở chính</Label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional & Security */}
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Vận hành & Chính sách Bảo mật</CardTitle>
                <CardDescription className="text-xs text-slate-500">Múi giờ, phân bổ Leads tự động và ghi nhật ký</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Đơn vị tiền tệ chính</Label>
                <Input
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Múi giờ hệ thống</Label>
                <Input
                  value={settings.defaultTimezone}
                  onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="autoAssign"
                  checked={settings.autoAssignLeads}
                  onCheckedChange={(c) => setSettings({ ...settings, autoAssignLeads: Boolean(c) })}
                />
                <Label htmlFor="autoAssign" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Tự động phân bổ Khách hàng tiềm năng (Leads) cho nhân viên kinh doanh theo vòng lặp Round-robin
                </Label>
              </div>

              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="enableAudit"
                  checked={settings.enableAuditLog}
                  onCheckedChange={(c) => setSettings({ ...settings, enableAuditLog: Boolean(c) })}
                />
                <Label htmlFor="enableAudit" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Bật ghi nhật ký kiểm toán truy cập dữ liệu bảo mật (Audit Logging)
                </Label>
              </div>

              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="enable2fa"
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(c) => setSettings({ ...settings, enableTwoFactor: Boolean(c) })}
                />
                <Label htmlFor="enable2fa" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Yêu cầu xác thực hai yếu tố (2FA / OTP) cho tất cả tài khoản Quản trị viên
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu Cấu hình Tổ chức</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
