import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, AlertCircle, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(255, 'Tối đa 255 ký tự'),
  email: z.string().email('Email không đúng định dạng').max(320, 'Tối đa 320 ký tự'),
  password: z.string().min(12, 'Mật khẩu phải có ít nhất 12 ký tự').max(128, 'Tối đa 128 ký tự'),
  tenantCode: z.string().min(2, 'Vui lòng nhập Mã Tập đoàn / Tổ chức muốn gia nhập'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      tenantCode: 'tap-doan-ipa',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLocalError(null);
    try {
      if (!values.tenantCode.trim()) {
        setLocalError('Vui lòng nhập Mã Tập đoàn / Tổ chức muốn gia nhập');
        return;
      }

      const normalizedTenantCode = values.tenantCode.trim().toLowerCase();

      await registerUser({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        tenantCode: normalizedTenantCode,
      });

      toast.info(
        `Đã gửi yêu cầu gia nhập Tập đoàn [${normalizedTenantCode}]. Vui lòng chờ Quản trị viên phê duyệt.`,
        { duration: 5000 }
      );

      navigate('/app/pending-approval', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Network Error')
        ) {
          setLocalError('Không thể kết nối tới dịch vụ Backend (http://localhost:8080). Vui lòng kiểm tra máy chủ backend.');
        } else if (err.message.includes('SELF_REGISTRATION_DISABLED')) {
          setLocalError('Hệ thống hiện chưa bật tính năng tự đăng ký tài khoản. Vui lòng liên hệ quản trị viên.');
        } else if (err.message.includes('EMAIL_ALREADY_REGISTERED')) {
          setLocalError('Địa chỉ email này đã được sử dụng. Vui lòng thử email khác hoặc đăng nhập.');
        } else {
          setLocalError(err.message);
        }
      } else {
        setLocalError('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* VUM Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black tracking-widest shadow-md">
            VUM
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">VUM CRM</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              {t('auth.registerHeading', 'Đăng ký tài khoản người dùng')}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Tạo tài khoản và gửi yêu cầu gia nhập Tổ chức / Tập đoàn
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {(error || localError) && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">{localError || error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">{t('auth.displayNameLabel', 'Họ và tên người dùng *')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('auth.displayNamePlaceholder', 'Nguyễn Văn A')}
                  className={errors.displayName ? 'border-destructive focus-visible:ring-destructive text-xs' : 'text-xs'}
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('auth.emailLabel', 'Địa chỉ Email công việc *')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder', 'nhap.email@vum.vn')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive text-xs' : 'text-xs'}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t('auth.passwordLabel', 'Mật khẩu (Tối thiểu 12 ký tự) *')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className={errors.password ? 'border-destructive focus-visible:ring-destructive text-xs' : 'text-xs'}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Organization Code to Join */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="tenantCode" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Mã Tập đoàn / Tổ chức gia nhập *</span>
                </Label>
                <Input
                  id="tenantCode"
                  type="text"
                  placeholder="VD: TAP-DOAN-IPA, vum-corp"
                  className="font-mono text-xs font-bold"
                  {...register('tenantCode')}
                />
                {errors.tenantCode && (
                  <p className="text-xs text-destructive">{errors.tenantCode.message}</p>
                )}

                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-slate-700 space-y-1 mt-2">
                  <div className="font-bold flex items-center gap-1 text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Quy trình gia nhập Tổ chức</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Sau khi đăng ký thành công, tài khoản sẽ ở trạng thái <strong>Chờ phê duyệt</strong>. Quản trị viên (Tenant Admin) của tập đoàn sẽ kiểm tra và xét duyệt quyền truy cập cho bạn.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold gap-2 bg-blue-600 hover:bg-blue-700 mt-2 text-xs" disabled={isLoading}>
                <UserPlus className="w-4 h-4" />
                <span>Gửi Yêu cầu Gia nhập</span>
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.alreadyHaveAccount', 'Đã có tài khoản? Đăng nhập ngay')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
