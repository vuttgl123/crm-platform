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
  HelpCircle,
  ShieldCheck,
  Check,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, loginWithSSO, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
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
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'ptv.admin@vum.vn',
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

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] relative flex flex-col justify-between items-center py-6 px-4 font-sans select-none overflow-hidden text-[#172B4D]">
      {/* ── Top Header Navigation Bar ── */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 px-2 sm:px-6">
        {/* Left: Atlassian Design System Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F2FF] text-[#0C66E4] rounded-full border border-[#CCE0FF] text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0C66E4]" />
          <span>Atlassian Design System</span>
        </div>

        {/* Right: Language & Help */}
        <div className="flex items-center gap-4 text-xs text-[#44546F]">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              type="button"
              className="flex items-center gap-1.5 text-xs text-[#44546F] hover:text-[#172B4D] font-medium py-1 px-2 rounded-[3px] hover:bg-slate-200/50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{i18n.language && i18n.language.startsWith('en') ? 'English' : 'Tiếng Việt'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-[#DFE1E6] rounded-[3px] shadow-lg py-1 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => toggleLanguage('vi')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F4F5F7] font-medium text-[#172B4D]"
                >
                  Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F4F5F7] font-medium text-[#172B4D]"
                >
                  English
                </button>
              </div>
            )}
          </div>

          <a
            href="#help"
            className="flex items-center gap-1 text-xs text-[#44546F] hover:text-[#172B4D] font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trợ giúp</span>
          </a>
        </div>
      </div>

      {/* ── Decorative Floating Jira Illustration (Bottom Left: Kanban Board) ── */}
      <div className="hidden xl:block absolute bottom-12 left-10 pointer-events-none z-10 select-none">
        <div className="relative">
          {/* Sprint Badge */}
          <div className="absolute -top-3.5 right-6 z-20 bg-[#0C66E4] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span>SPRINT 24</span>
          </div>
          <div className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-[#00C7E5] ring-2 ring-white z-20" />

          {/* Kanban Card Container */}
          <div className="w-48 bg-white rounded-[6px] border border-[#EBECF0] shadow-[0px_8px_24px_rgba(9,30,66,0.12)] p-3 space-y-2">
            {/* Top Bar Skeleton */}
            <div className="flex items-center justify-between pb-1">
              <div className="w-14 h-2 bg-[#0C66E4] rounded-full" />
              <div className="w-10 h-2 bg-slate-200 rounded-full" />
            </div>

            {/* 2 Mini Columns */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F4F5F7] rounded-[4px] p-1.5 space-y-1.5 min-h-[90px]">
                <div className="bg-white p-1 rounded-[3px] border border-[#DFE1E6] space-y-1 shadow-2xs">
                  <div className="w-10 h-1.5 bg-slate-400 rounded-full" />
                  <div className="w-7 h-1 bg-slate-200 rounded-full" />
                </div>
                <div className="bg-white p-1 rounded-[3px] border border-[#DFE1E6] space-y-1 shadow-2xs">
                  <div className="w-8 h-1.5 bg-slate-400 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-[#FF7452]" />
                </div>
                <div className="bg-white p-1 rounded-[3px] border border-[#DFE1E6] space-y-1 shadow-2xs">
                  <div className="w-8 h-1.5 bg-slate-400 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-[#36B37E]" />
                </div>
              </div>

              <div className="bg-[#F4F5F7] rounded-[4px] p-1.5 space-y-1.5 min-h-[90px]">
                {/* Active Selected Card */}
                <div className="bg-white p-1.5 rounded-[3px] border-2 border-[#0C66E4] space-y-1 shadow-xs">
                  <div className="w-12 h-1.5 bg-[#0C66E4] rounded-full" />
                  <div className="w-8 h-1 bg-slate-300 rounded-full" />
                  <div className="flex justify-end pt-1">
                    <Check className="w-3 h-3 text-[#0C66E4]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Curved Connection Line with Node */}
          <div className="absolute -bottom-6 -right-6 flex items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M 5 35 Q 20 15 35 5"
                stroke="#36B37E"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="w-4 h-4 rounded-full bg-[#36B37E] ring-4 ring-[#36B37E]/20 -ml-2" />
          </div>
        </div>
      </div>

      {/* ── Decorative Floating Jira Illustration (Bottom Right: Chart & Metric) ── */}
      <div className="hidden xl:block absolute bottom-14 right-12 pointer-events-none z-10 select-none">
        <div className="relative">
          {/* Gold Star Badge on Corner */}
          <div className="absolute -top-3 -left-3 z-20 w-7 h-7 bg-[#FFAB00] text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
            <Star className="w-3.5 h-3.5 fill-white" />
          </div>

          {/* Metric Chart Card Container */}
          <div className="w-44 bg-white rounded-[6px] border border-[#EBECF0] shadow-[0px_8px_24px_rgba(9,30,66,0.12)] p-3.5 space-y-3">
            {/* Header with Circular Progress Ring */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-14 h-2 bg-[#172B4D] rounded-full" />
                <div className="w-8 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#0C66E4] flex items-center justify-center text-[9px] font-bold text-[#0C66E4]">
                86%
              </div>
            </div>

            {/* Bar Chart Columns */}
            <div className="flex items-end justify-between h-14 pt-2 px-1 gap-1.5 border-b border-slate-100">
              <div className="w-2.5 h-6 bg-[#DEEBFF] rounded-t-[2px]" />
              <div className="w-2.5 h-9 bg-[#B3D4FF] rounded-t-[2px]" />
              <div className="w-2.5 h-12 bg-[#4C9AFF] rounded-t-[2px]" />
              <div className="w-2.5 h-14 bg-[#0C66E4] rounded-t-[2px]" />
              <div className="w-2.5 h-8 bg-[#00C7E5] rounded-t-[2px]" />
              <div className="w-2.5 h-11 bg-[#36B37E] rounded-t-[2px]" />
            </div>

            {/* Status Lozenge */}
            <div className="pt-0.5">
              <span className="inline-block px-2 py-0.5 rounded-[3px] bg-[#E3FCEF] text-[#006644] font-bold text-[10px] tracking-wide">
                ON TRACK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Centered Login Card ── */}
      <div className="w-full max-w-[440px] my-auto z-20 py-4">
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0px_4px_24px_rgba(9,30,66,0.08),0px_0px_1px_rgba(9,30,66,0.25)] p-8 sm:p-10">
          {/* Logo Header */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-[4px] bg-[#0C66E4] flex items-center justify-center text-white shadow-xs">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8v4.33c2.43 0 4.4 1.95 4.4 4.35v4.37c0 .44.36.8.8.8h4.33c0-2.4 1.97-4.35 4.4-4.35h4.33a.8.8 0 0 0 .8-.8v-4.33c-2.43 0-4.4-1.95-4.4-4.35V3.8a.8.8 0 0 0-.8-.8H11.53z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold tracking-tight text-[#172B4D] leading-none">
                  VUM <span className="text-[#0C66E4]">CRM</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#626F86] mt-0.5">
                  ENTERPRISE CLOUD
                </div>
              </div>
            </div>

            <h1 className="text-base sm:text-lg font-bold text-[#172B4D] pt-2">
              Đăng nhập vào tài khoản VUM CRM
            </h1>
          </div>

          {/* Error Alert */}
          {(error || localError) && (
            <Alert variant="destructive" className="mb-4 py-2 px-3 rounded-[3px] border-rose-200 bg-rose-50 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <AlertDescription className="text-xs leading-relaxed">{localError || error}</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase block">
                ĐỊA CHỈ EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ptv.admin@vum.vn"
                className={`h-10 text-xs sm:text-sm bg-white border-[#DFE1E6] rounded-[3px] text-[#172B4D] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-[#8993A4] ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase">
                  MẬT KHẨU
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#0C66E4] hover:underline font-medium"
                >
                  Không thể đăng nhập?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`h-10 pr-9 text-xs sm:text-sm bg-white border-[#DFE1E6] rounded-[3px] text-[#172B4D] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-[#8993A4] ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#626F86] hover:text-[#172B4D] focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Stay Signed In Checkbox */}
            <div className="flex items-center space-x-2 pt-0.5">
              <Checkbox
                id="staySignedIn"
                checked={staySignedIn}
                onCheckedChange={(checked) => setStaySignedIn(Boolean(checked))}
                className="h-4 w-4 rounded-[2px] border-[#DFE1E6] data-[state=checked]:bg-[#0C66E4] data-[state=checked]:border-[#0C66E4]"
              />
              <label
                htmlFor="staySignedIn"
                className="text-xs text-[#44546F] font-normal cursor-pointer select-none"
              >
                Duy trì đăng nhập trong 30 ngày
              </label>
            </div>

            {/* Submit Button (Jira Blue #0C66E4) */}
            <Button
              type="submit"
              className="w-full h-10 bg-[#0C66E4] hover:bg-[#0052CC] active:bg-[#0747A6] text-white font-semibold text-xs sm:text-sm rounded-[3px] shadow-none mt-2 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DFE1E6]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-[#626F86]">
                HOẶC TIẾP TỤC VỚI
              </span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-2.5">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-xs gap-2 font-medium bg-white hover:bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-[#172B4D] justify-center shadow-none transition-colors"
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
              className="w-full h-10 text-xs gap-2 font-medium bg-white hover:bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-[#172B4D] justify-center shadow-none transition-colors"
              onClick={() => handleSSO('MICROSOFT')}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H1z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          {/* Registration & SSO Links */}
          <div className="text-center pt-5 space-y-2">
            <Link
              to="/register"
              className="text-xs font-semibold text-[#0C66E4] hover:underline block"
            >
              Tạo tài khoản mới
            </Link>
            <a
              href="#sso"
              className="text-xs text-[#626F86] hover:text-[#172B4D] hover:underline block"
            >
              Đăng nhập bằng SSO Doanh nghiệp
            </a>
          </div>
        </div>
      </div>

      {/* ── Page Bottom Footer ── */}
      <footer className="w-full max-w-2xl text-center space-y-2 text-xs text-[#626F86] py-3 z-20">
        <div className="text-[11px]">
          Một tài khoản cho toàn bộ hệ thống VUM CRM Doanh nghiệp
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px]">
          <a href="#privacy" className="hover:text-[#172B4D] hover:underline">Chính sách quyền riêng tư</a>
          <span>•</span>
          <a href="#terms" className="hover:text-[#172B4D] hover:underline">Điều khoản người dùng</a>
          <span>•</span>
          <a href="#support" className="hover:text-[#172B4D] hover:underline">Hỗ trợ</a>
        </div>
        <div className="text-[10px] text-[#8993A4] pt-3">
          © 2026 VUM Corporation. All rights reserved. Powered by Jira Cloud Architecture.
        </div>
      </footer>

      {/* Subtle bottom wavy background graphic */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50/40 to-transparent pointer-events-none z-0" />
    </div>
  );
};

