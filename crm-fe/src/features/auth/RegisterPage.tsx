import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(255, 'Tối đa 255 ký tự'),
  email: z.string().email('Email không đúng định dạng').max(320, 'Tối đa 320 ký tự'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(128, 'Tối đa 128 ký tự'),
  tenantName: z.string().min(2, 'Vui lòng nhập Tên Doanh nghiệp / Tổ chức'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
      tenantName: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (!agreeTerms) {
      setLocalError('Vui lòng đồng ý với Thỏa thuận Khách hàng và Chính sách Quyền riêng tư.');
      return;
    }

    setLocalError(null);
    try {
      const generatedTenantCode = values.tenantName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      await registerUser({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        tenantCode: generatedTenantCode || 'tap-doan-ipa',
      });

      toast.success('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      navigate('/app/overview', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Network Error')
        ) {
          setLocalError('Không thể kết nối tới dịch vụ Backend. Vui lòng kiểm tra máy chủ backend.');
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

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] relative flex flex-col justify-between items-center py-6 px-4 font-sans select-none overflow-hidden text-[#172B4D]">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 px-2 sm:px-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E9F2FF] text-[#0C66E4] rounded-full border border-[#CCE0FF] text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0C66E4]" />
          <span>Atlassian Design System</span>
        </div>

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

      <div className="hidden xl:block absolute bottom-12 left-10 pointer-events-none z-10 select-none">
        <div className="relative">
          <div className="absolute -top-3.5 right-6 z-20 bg-[#0C66E4] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span>SPRINT 24</span>
          </div>
          <div className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-[#00C7E5] ring-2 ring-white z-20" />

          <div className="w-48 bg-white rounded-[6px] border border-[#EBECF0] shadow-[0px_8px_24px_rgba(9,30,66,0.12)] p-3 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <div className="w-14 h-2 bg-[#0C66E4] rounded-full" />
              <div className="w-10 h-2 bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F4F5F7] rounded-[4px] p-1.5 space-y-1.5 min-h-[90px]">
                <div className="bg-white p-1 rounded-[3px] border border-[#DFE1E6] space-y-1 shadow-2xs">
                  <div className="w-10 h-1.5 bg-slate-400 rounded-full" />
                </div>
                <div className="bg-white p-1 rounded-[3px] border border-[#DFE1E6] space-y-1 shadow-2xs">
                  <div className="w-8 h-1.5 bg-slate-400 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-[#FF7452]" />
                </div>
              </div>
              <div className="bg-[#F4F5F7] rounded-[4px] p-1.5 space-y-1.5 min-h-[90px]">
                <div className="bg-white p-1.5 rounded-[3px] border-2 border-[#0C66E4] space-y-1 shadow-xs">
                  <div className="w-12 h-1.5 bg-[#0C66E4] rounded-full" />
                  <div className="flex justify-end pt-1">
                    <Check className="w-3 h-3 text-[#0C66E4]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

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

      <div className="hidden xl:block absolute bottom-14 right-12 pointer-events-none z-10 select-none">
        <div className="relative">
          <div className="absolute -top-3 -left-3 z-20 w-7 h-7 bg-[#FFAB00] text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
            <Star className="w-3.5 h-3.5 fill-white" />
          </div>

          <div className="w-44 bg-white rounded-[6px] border border-[#EBECF0] shadow-[0px_8px_24px_rgba(9,30,66,0.12)] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-14 h-2 bg-[#172B4D] rounded-full" />
                <div className="w-8 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#0C66E4] flex items-center justify-center text-[9px] font-bold text-[#0C66E4]">
                86%
              </div>
            </div>

            <div className="flex items-end justify-between h-14 pt-2 px-1 gap-1.5 border-b border-slate-100">
              <div className="w-2.5 h-6 bg-[#DEEBFF] rounded-t-[2px]" />
              <div className="w-2.5 h-9 bg-[#B3D4FF] rounded-t-[2px]" />
              <div className="w-2.5 h-12 bg-[#4C9AFF] rounded-t-[2px]" />
              <div className="w-2.5 h-14 bg-[#0C66E4] rounded-t-[2px]" />
              <div className="w-2.5 h-8 bg-[#00C7E5] rounded-t-[2px]" />
              <div className="w-2.5 h-11 bg-[#36B37E] rounded-t-[2px]" />
            </div>

            <div className="pt-0.5">
              <span className="inline-block px-2 py-0.5 rounded-[3px] bg-[#E3FCEF] text-[#006644] font-bold text-[10px] tracking-wide">
                ON TRACK
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[440px] my-auto z-20 py-4">
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0px_4px_24px_rgba(9,30,66,0.08),0px_0px_1px_rgba(9,30,66,0.25)] p-8 sm:p-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs text-[#626F86] hover:text-[#172B4D] font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Đăng nhập</span>
          </Link>

          <div className="text-center space-y-1 mb-5">
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
              Đăng ký tài khoản VUM CRM
            </h1>
            <p className="text-xs text-[#626F86]">
              Bắt đầu dùng thử miễn phí 14 ngày, không cần thẻ tín dụng
            </p>
          </div>

          {(error || localError) && (
            <Alert variant="destructive" className="mb-4 py-2 px-3 rounded-[3px] border-rose-200 bg-rose-50 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <AlertDescription className="text-xs leading-relaxed">{localError || error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase block">
                HỌ VÀ TÊN
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Nguyễn Văn A"
                className={`h-10 text-xs sm:text-sm bg-white border-[#DFE1E6] rounded-[3px] text-[#172B4D] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-[#8993A4] ${
                  errors.displayName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''
                }`}
                {...register('displayName')}
              />
              {errors.displayName && (
                <p className="text-[11px] text-rose-600 mt-0.5">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase block">
                ĐỊA CHỈ EMAIL CÔNG VIỆC
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ten.ban@congty.vn"
                className={`h-10 text-xs sm:text-sm bg-white border-[#DFE1E6] rounded-[3px] text-[#172B4D] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-[#8993A4] ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="tenantName" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase block">
                TÊN DOANH NGHIỆP / TỔ CHỨC
              </Label>
              <Input
                id="tenantName"
                type="text"
                placeholder="Ví dụ: VUM Media Corp"
                className={`h-10 text-xs sm:text-sm bg-white border-[#DFE1E6] rounded-[3px] text-[#172B4D] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-[#8993A4] ${
                  errors.tenantName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''
                }`}
                {...register('tenantName')}
              />
              {errors.tenantName && (
                <p className="text-[11px] text-rose-600 mt-0.5">{errors.tenantName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-[11px] font-bold tracking-wider text-[#44546F] uppercase block">
                MẬT KHẨU
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
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

            <div className="flex items-start space-x-2 pt-1">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                className="h-4 w-4 mt-0.5 rounded-[2px] border-[#DFE1E6] data-[state=checked]:bg-[#0C66E4] data-[state=checked]:border-[#0C66E4]"
              />
              <label
                htmlFor="agreeTerms"
                className="text-xs text-[#44546F] leading-tight font-normal cursor-pointer select-none"
              >
                Tôi đồng ý với Thỏa thuận Khách hàng và Chính sách Quyền riêng tư của VUM CRM.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-[#0C66E4] hover:bg-[#0052CC] active:bg-[#0747A6] text-white font-semibold text-xs sm:text-sm rounded-[3px] shadow-none mt-2 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Đang khởi tạo...' : 'Tạo tài khoản Doanh nghiệp'}
            </Button>
          </form>

          <div className="text-center pt-5 text-xs text-[#626F86]">
            <span>Đã có tài khoản? </span>
            <Link
              to="/login"
              className="text-[#0C66E4] font-semibold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* ── Page Bottom Footer ── */}
      <footer className="w-full max-w-2xl text-center space-y-2 text-xs text-[#626F86] py-3 z-20">
        <div className="text-[10px] text-[#8993A4]">
          © 2026 VUM Corporation. All rights reserved. Powered by Jira Cloud Architecture.
        </div>
      </footer>

      {/* Subtle bottom wavy background graphic */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50/40 to-transparent pointer-events-none z-0" />
    </div>
  );
};
