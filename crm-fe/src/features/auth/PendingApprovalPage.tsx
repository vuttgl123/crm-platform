import React from 'react';
import { useAuth } from '@/core/session/useAuth';
import { Clock, ShieldAlert, LogOut, RefreshCw, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const PendingApprovalPage: React.FC = () => {
  const { session, logout } = useAuth();

  const handleRefreshStatus = () => {
    toast.info('Đang kiểm tra lại trạng thái xét duyệt với Quản trị viên...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black tracking-wider text-base">
            VUM
          </div>
          <span className="text-xl font-bold text-slate-900">VUM CRM</span>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Yêu cầu Gia nhập đang Chờ Phê duyệt
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Tài khoản của bạn đã gửi yêu cầu gia nhập Tập đoàn thành công
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tài khoản đăng ký:</span>
                <span className="font-semibold text-slate-900">{session?.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tổ chức / Tập đoàn:</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {session?.tenant.display_name || session?.tenant.tenant_code || 'Tập đoàn IPA'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái xét duyệt:</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-semibold gap-1">
                  <Clock className="w-3 h-3" />
                  Chờ Duyệt (INVITED)
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Quy trình xét duyệt của Quản trị viên</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Tài khoản Quản trị viên (Tenant Admin) của tập đoàn đã nhận được yêu cầu của bạn. Ngay sau khi Quản trị viên ấn nút <strong>Phê duyệt (Approve)</strong>, bạn có thể truy cập toàn bộ hệ thống.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t pt-4">
            <Button
              onClick={handleRefreshStatus}
              className="w-full font-semibold gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Kiểm tra lại trạng thái
            </Button>

            <Button
              variant="outline"
              onClick={logout}
              className="w-full text-slate-600 hover:bg-slate-100 font-semibold gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất tài khoản
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
