import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { DemoRoleCode } from '@/types/auth';
import { DEMO_ROLES } from '@/mocks/fixtures/demoData';
import { useTranslation } from 'react-i18next';

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
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@vum.vn',
      password: 'Demo@123456',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLocalError(null);
    try {
      await login(values);
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
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

  const handleQuickSelectRole = (code: DemoRoleCode) => {
    const roleDef = DEMO_ROLES[code];
    setValue('email', roleDef.userEmail);
    setValue('password', 'Demo@123456');
    setLocalError(null);
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
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          {t('auth.loginHeading', 'Đăng nhập vào VUM')}
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          {t('auth.loginSubtitle', 'Hệ thống Quản trị Quan hệ Khách hàng Doanh nghiệp')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          {/* Error Alert */}
          {(error || localError) && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                {t('auth.emailLabel', 'Địa chỉ Email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`block w-full rounded-md border ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  } px-3 py-2 text-sm shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600`}
                  placeholder={t('auth.emailPlaceholder', 'nhap.email@vum.vn')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                {t('auth.passwordLabel', 'Mật khẩu')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full rounded-md border ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  } px-3 py-2 text-sm shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600`}
                  placeholder={t('auth.passwordPlaceholder', '••••••••')}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t('auth.loginButton', 'Đăng nhập')}
              </button>
            </div>
          </form>

          {/* SSO Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">Đăng nhập mô phỏng SSO</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSSO('GOOGLE')}
                className="w-full inline-flex justify-center items-center gap-2 py-2 px-3 border border-slate-300 rounded-md shadow-xs bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
              </button>

              <button
                type="button"
                onClick={() => handleSSO('MICROSOFT')}
                className="w-full inline-flex justify-center items-center gap-2 py-2 px-3 border border-slate-300 rounded-md shadow-xs bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                Microsoft SSO
              </button>
            </div>
          </div>

          {/* Quick Login Roles */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <span>{t('auth.orContinueWith', 'Hoặc chọn tài khoản thử nghiệm:')}</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(DEMO_ROLES) as DemoRoleCode[]).map((code) => {
                const r = DEMO_ROLES[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleQuickSelectRole(code)}
                    className="w-full text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{r.nameVi}</span>
                      <span className="text-[11px] text-slate-500 ml-1">({r.userEmail})</span>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {r.scopeType}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-400 text-center">
              {t('auth.demoCredentialsNotice', 'Tất cả tài khoản dùng chung mật khẩu thử nghiệm: Demo@123456')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
