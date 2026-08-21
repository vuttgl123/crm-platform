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
  ChevronDown,
  Building2,
  Mail,
  User,
  Lock,
  ArrowLeft
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
import { toast } from 'sonner';

const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(255, 'Tối đa 255 ký tự'),
  email: z
    .string()
    .trim()
    .email('Email không đúng định dạng')
    .max(320, 'Tối đa 320 ký tự'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Tối đa 128 ký tự'),
  tenantName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập Tên Doanh nghiệp / Tổ chức'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
        tenantCode: generatedTenantCode || 'vum-enterprise',
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
          setLocalError(
            'Không thể kết nối tới máy chủ (Backend). Vui lòng thử lại hoặc đăng nhập bằng tài khoản mẫu.'
          );
        } else if (err.message.includes('SELF_REGISTRATION_DISABLED')) {
          setLocalError('Hệ thống hiện chưa bật tính năng tự đăng ký. Vui lòng liên hệ Quản trị viên.');
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
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-between items-center py-8 sm:py-12 px-4 font-sans text-[#07182B] selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
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
          to="/login"
          className="text-xs font-semibold text-[#085AC0] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('landing.nav.login', 'Đăng nhập')}</span>
        </Link>
      </div>

      {/* Main Register Card */}
      <Card className="w-full max-w-md bg-white border border-[#DCE5F0] rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1.5 bg-[#085AC0] w-full" />
        <CardHeader className="space-y-1.5 pb-4 pt-6 px-6 sm:px-8 text-center">
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-[#07182B] tracking-tight">
            Đăng ký tài khoản Doanh nghiệp
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#52647A]">
            Khởi tạo không gian làm việc và trải nghiệm VUM CRM
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 sm:px-8 pt-2">
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
          <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                HỌ VÀ TÊN <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  className={`h-10 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 pl-9 ${
                    errors.displayName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('displayName')}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.displayName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                EMAIL CÔNG VIỆC <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`h-10 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 pl-9 ${
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

            {/* Company / Organization Name */}
            <div className="space-y-1.5">
              <Label htmlFor="tenantName" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                TÊN DOANH NGHIỆP / TỔ CHỨC <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="tenantName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Tập đoàn An Phát"
                  className={`h-10 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 pl-9 ${
                    errors.tenantName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('tenantName')}
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.tenantName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.tenantName.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                MẬT KHẨU <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  className={`h-10 pr-10 pl-9 text-sm bg-white border-[#DCE5F0] rounded-lg text-[#07182B] focus:border-[#085AC0] placeholder:text-slate-400 ${
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

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                className="h-4 w-4 rounded border-[#DCE5F0] data-[state=checked]:bg-[#085AC0] data-[state=checked]:border-[#085AC0] mt-0.5"
              />
              <label
                htmlFor="agreeTerms"
                className="text-xs text-[#52647A] leading-relaxed cursor-pointer select-none"
              >
                Tôi đồng ý với Thỏa thuận Khách hàng và Chính sách Quyền riêng tư của VUM CRM.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Doanh nghiệp'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-6 px-6 sm:px-8 border-t border-slate-100 text-center">
          <div className="text-xs text-[#52647A]">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-[#085AC0] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Footer */}
      <footer className="w-full max-w-md text-center space-y-2 text-xs text-[#52647A] pt-6">
        <div className="flex items-center justify-center gap-3">
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

export default RegisterPage;
