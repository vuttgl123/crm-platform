import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  ArrowRight,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const loginSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, loginWithSSO, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
          setLocalError(
            'Không thể kết nối tới dịch vụ máy chủ (Backend). Ứng dụng sẽ tiếp tục ở chế độ Mock Data.'
          );
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

  const setDemoAccount = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Demo@123456', { shouldValidate: true });
  };

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-between items-center py-8 sm:py-12 px-4 font-sans text-[#07182B] selection:bg-blue-100 selection:text-blue-900">
      {/* Top Brand Link */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="VUM CRM Home"
        >
          <div className="w-9 h-9 rounded-lg bg-[#07182B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#085AC0] transition-colors">
            <span className="font-extrabold text-lg tracking-tight" translate="no">
              V
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-[#07182B] leading-none" translate="no">
              VUM CRM
            </span>
            <span className="text-[10px] font-semibold text-[#52647A] tracking-wider uppercase mt-0.5">
              Enterprise Cloud
            </span>
          </div>
        </Link>

        <Link
          to="/demo"
          className="text-xs font-semibold text-[#085AC0] hover:underline flex items-center gap-1"
        >
          <span>{t('landing.nav.demo')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md bg-white border border-[#DCE5F0] rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1.5 bg-[#085AC0] w-full" />
        <CardHeader className="space-y-1.5 pb-4 pt-6 px-6 sm:px-8 text-center">
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-[#07182B] tracking-tight">
            {t('auth.loginHeading', 'Đăng nhập vào VUM')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#52647A]">
            {t('auth.loginSubtitle', 'Hệ thống Quản trị Quan hệ Khách hàng Doanh nghiệp')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 sm:px-8 pt-2">
          {/* Error Alert */}
          {(error || localError) && (
            <Alert
              variant="destructive"
              className="py-2.5 px-3 rounded-lg border-rose-200 bg-rose-50 text-rose-800 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <AlertDescription className="text-xs leading-relaxed">
                {localError || error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('auth.emailLabel', 'ĐỊA CHỈ EMAIL')}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`h-11 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 pl-9 ${
                    errors.email ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('email')}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                  {t('auth.passwordLabel', 'MẬT KHẨU')}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`h-11 pr-10 pl-9 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 ${
                    errors.password ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('password')}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#07182B] focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Stay Signed In */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="staySignedIn"
                checked={staySignedIn}
                onCheckedChange={(checked) => setStaySignedIn(Boolean(checked))}
                className="h-4 w-4 rounded border-[#DCE5F0] data-[state=checked]:bg-[#085AC0] data-[state=checked]:border-[#085AC0]"
              />
              <label
                htmlFor="staySignedIn"
                className="text-xs text-[#52647A] cursor-pointer select-none"
              >
                Duy trì đăng nhập trong 30 ngày
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : t('auth.loginButton', 'Đăng nhập')}
            </Button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#07182B] uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#085AC0]" />
                  Tài khoản thử nghiệm nhanh (1-Click)
                </span>
                <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600">
                  Mock Mode
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { role: 'Admin', email: 'admin@vum.vn' },
                  { role: 'Quản lý vùng', email: 'manager@vum.vn' },
                  { role: 'Trưởng nhóm', email: 'lead@vum.vn' },
                  { role: 'Nhân viên', email: 'staff@vum.vn' },
                  { role: 'Chỉ xem', email: 'viewer@vum.vn' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setDemoAccount(acc.email)}
                    className="px-2 py-1.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left text-[11px] font-medium text-[#07182B] transition-colors"
                  >
                    <span className="font-bold text-[#085AC0] block truncate">{acc.role}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DCE5F0]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-[#52647A]">
                {t('auth.orContinueWith', 'HOẶC ĐĂNG NHẬP VỚI')}
              </span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 text-xs gap-2 font-medium bg-white hover:bg-slate-50 border-[#DCE5F0] rounded-lg text-[#07182B] justify-center transition-colors"
              onClick={() => handleSSO('GOOGLE')}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-10 text-xs gap-2 font-medium bg-white hover:bg-slate-50 border-[#DCE5F0] rounded-lg text-[#07182B] justify-center transition-colors"
              onClick={() => handleSSO('MICROSOFT')}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-6 px-6 sm:px-8 border-t border-slate-100 text-center">
          <div className="text-xs text-[#52647A]">
            Chưa có tài khoản doanh nghiệp?{' '}
            <Link to="/register" className="font-semibold text-[#085AC0] hover:underline">
              Đăng ký dùng thử
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Footer & Language Switcher */}
      <footer className="w-full max-w-md text-center space-y-2 text-xs text-[#52647A] pt-6">
        <div className="flex items-center justify-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              type="button"
              className="flex items-center gap-1.5 text-xs text-[#52647A] hover:text-[#07182B] font-medium py-1 px-2 rounded-md hover:bg-slate-200/50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{i18n.language && i18n.language.startsWith('en') ? 'English' : 'Tiếng Việt'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLangMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-32 bg-white border border-[#DCE5F0] rounded-lg shadow-lg py-1 z-50 text-xs text-left">
                <button
                  type="button"
                  onClick={() => toggleLanguage('vi')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F5F8FC] font-medium text-[#07182B]"
                >
                  Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F5F8FC] font-medium text-[#07182B]"
                >
                  English
                </button>
              </div>
            )}
          </div>

          <span>•</span>

          <Link to="/demo" className="text-xs text-[#52647A] hover:text-[#07182B] hover:underline">
            Tư vấn &amp; Demo
          </Link>
        </div>

        <div className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} VUM CRM. Nền tảng quản trị khách hàng và doanh số.
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
