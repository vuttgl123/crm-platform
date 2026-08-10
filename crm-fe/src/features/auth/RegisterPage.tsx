import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
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

const registerSchema = z.object({
  displayName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(255, 'Tối đa 255 ký tự'),
  email: z.string().email('Email không đúng định dạng').max(320, 'Tối đa 320 ký tự'),
  password: z.string().min(12, 'Mật khẩu phải có ít nhất 12 ký tự').max(128, 'Tối đa 128 ký tự'),
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
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLocalError(null);
    try {
      await registerUser(values);
      navigate('/app/overview', { replace: true });
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
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-black tracking-widest shadow-md">
            VUM
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">VUM CRM</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              {t('auth.registerHeading', 'Đăng ký tài khoản mới')}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {t('auth.registerSubtitle', 'Tạo tài khoản người dùng cho hệ thống VUM CRM')}
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
                <Label htmlFor="displayName">{t('auth.displayNameLabel', 'Họ và tên')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('auth.displayNamePlaceholder', 'Nguyễn Văn A')}
                  className={errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('auth.emailLabel', 'Địa chỉ Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder', 'nhap.email@vum.vn')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t('auth.passwordLabel', 'Mật khẩu (Tối thiểu 12 ký tự)')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full font-semibold gap-2" disabled={isLoading}>
                <UserPlus className="w-4 h-4" />
                {t('auth.registerButton', 'Đăng ký tài khoản')}
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
