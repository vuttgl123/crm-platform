import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, loginWithSSO, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl')
    ? decodeURIComponent(searchParams.get('returnUrl')!)
    : '/app/overview';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLocalError(null);
    try {
      await login(values);
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Network Error')
        ) {
          setLocalError('Không thể kết nối tới dịch vụ Backend (http://localhost:8080). Vui lòng kiểm tra máy chủ backend.');
        } else {
          setLocalError(err.message);
        }
      } else {
        setLocalError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  };

  const handleSSO = async (provider: 'GOOGLE' | 'MICROSOFT') => {
    setLocalError(null);
    try {
      await loginWithSSO({ provider });
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
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
              {t('auth.loginHeading', 'Đăng nhập vào VUM')}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {t('auth.loginSubtitle', 'Hệ thống Quản trị Quan hệ Khách hàng Doanh nghiệp')}
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

            {/* Email / Password Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <Label htmlFor="password">{t('auth.passwordLabel', 'Mật khẩu')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder', '••••••••')}
                  className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full font-semibold gap-2" disabled={isLoading}>
                <LogIn className="w-4 h-4" />
                {t('auth.loginButton', 'Đăng nhập')}
              </Button>
            </form>

            {/* SSO Section */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc đăng nhập qua SSO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs gap-2 font-medium"
                onClick={() => handleSSO('GOOGLE')}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.16 0 9.99 0 12s.44 3.84 1.23 5.42l4.05-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google SSO
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full text-xs gap-2 font-medium"
                onClick={() => handleSSO('MICROSOFT')}
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H1z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                Microsoft SSO
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t('auth.noAccountYet', 'Chưa có tài khoản? Đăng ký ngay')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
