import { useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { demoRequestService, PublicDemoRequestError } from '../services/demoRequestService';
import {
  CompanySize,
  DemoIndustry,
  DemoPrimaryNeed,
  DemoRequestInput,
} from '../types/landing';

const phonePattern = /^[0-9+().\-\s]{8,20}$/;

const createDemoRequestSchema = (t: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t('landing.demo.validation.fullName'))
      .max(100, t('landing.demo.validation.fullName')),
    workEmail: z
      .string()
      .trim()
      .email(t('landing.demo.validation.workEmail'))
      .max(254, t('landing.demo.validation.workEmail')),
    phone: z
      .string()
      .trim()
      .regex(phonePattern, t('landing.demo.validation.phone')),
    companyName: z
      .string()
      .trim()
      .min(2, t('landing.demo.validation.companyName'))
      .max(160, t('landing.demo.validation.companyName')),
    companySize: z.enum(
      ['UNDER_50', 'FROM_50_TO_199', 'FROM_200_TO_999', 'FROM_1000'],
      {
        required_error: t('landing.demo.validation.companySize'),
        invalid_type_error: t('landing.demo.validation.companySize'),
      }
    ),
    industry: z.enum(
      [
        'FINANCE',
        'REAL_ESTATE',
        'RETAIL_FNB',
        'MANUFACTURING_DISTRIBUTION',
        'TECHNOLOGY_B2B',
        'OTHER',
      ],
      {
        required_error: t('landing.demo.validation.industry'),
        invalid_type_error: t('landing.demo.validation.industry'),
      }
    ),
    primaryNeed: z.enum(
      [
        'CUSTOMER_360',
        'SALES_PIPELINE',
        'QUOTES_CONTRACTS',
        'AUTOMATION_FORECAST',
        'SECURITY_INTEGRATION',
        'OTHER',
      ],
      {
        required_error: t('landing.demo.validation.primaryNeed'),
        invalid_type_error: t('landing.demo.validation.primaryNeed'),
      }
    ),
    message: z
      .string()
      .trim()
      .max(1000, t('landing.demo.validation.message'))
      .optional()
      .or(z.literal('')),
    privacyConsent: z.boolean().refine((val) => val === true, {
      message: t('landing.demo.validation.privacyConsent'),
    }),
  });

type DemoFormData = z.infer<ReturnType<typeof createDemoRequestSchema>>;

export interface DemoRequestFormProps {
  privacyPolicyUrl: string;
  salesEmail?: string;
  salesPhone?: string;
}

const primaryNeedOptions = [
  { value: 'CUSTOMER_360' as const, label: 'Customer 360° & Danh bạ' },
  { value: 'SALES_PIPELINE' as const, label: 'Pipeline & Quản lý cơ hội' },
  { value: 'QUOTES_CONTRACTS' as const, label: 'Báo giá & Hợp đồng B2B' },
  { value: 'AUTOMATION_FORECAST' as const, label: 'Tự động hóa & Dự báo KPI' },
  { value: 'SECURITY_INTEGRATION' as const, label: 'Bảo mật RBAC & Kiểm toán' },
  { value: 'OTHER' as const, label: 'Nhu cầu khác' },
];

export function DemoRequestForm({
  privacyPolicyUrl,
  salesEmail,
  salesPhone,
}: DemoRequestFormProps): ReactElement {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const schema = createDemoRequestSchema(t);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      workEmail: '',
      phone: '',
      companyName: '',
      primaryNeed: 'CUSTOMER_360',
      message: '',
      privacyConsent: false,
    },
  });

  const selectedNeed = watch('primaryNeed');

  const onSubmit = async (data: DemoFormData) => {
    setSubmissionStatus('idle');
    setErrorMessage(null);

    const payload: DemoRequestInput = {
      fullName: data.fullName,
      workEmail: data.workEmail,
      phone: data.phone,
      companyName: data.companyName,
      companySize: data.companySize as CompanySize,
      industry: data.industry as DemoIndustry,
      primaryNeed: data.primaryNeed as DemoPrimaryNeed,
      message: data.message?.trim() ? data.message.trim() : undefined,
      privacyConsent: true,
      locale: i18n.resolvedLanguage === 'en' ? 'en' : 'vi',
      sourcePath: location.pathname,
    };

    try {
      await demoRequestService.submit(payload);
      setSubmissionStatus('success');
      reset();
    } catch (err) {
      setSubmissionStatus('error');
      if (err instanceof PublicDemoRequestError) {
        setErrorMessage(t('landing.demo.states.errorDescription'));
      } else {
        setErrorMessage(t('landing.demo.states.errorDescription'));
      }
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-blue-950/5 overflow-hidden">
        <div className="h-1.5 bg-emerald-500 w-full" />
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#07182B] landing-display">
              {t('landing.demo.states.successTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
              {t('landing.demo.states.successDescription')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs text-slate-600">
            <div className="font-bold text-[#07182B] uppercase tracking-wide">Các bước tiếp theo:</div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-[#085AC0] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>Chuyên gia VUM sẽ liên hệ xác nhận khung giờ trong vòng 2 giờ làm việc.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-[#085AC0] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>Gửi link phòng họp trực tuyến và tài liệu giải pháp tới email của bạn.</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setSubmissionStatus('idle')}
              variant="outline"
              className="text-xs font-semibold"
            >
              Gửi thêm yêu cầu khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-blue-950/5 overflow-hidden transition-all duration-300">
      {/* Top Brand Accent Bar */}
      <div className="h-1.5 bg-[#085AC0] w-full" />
      
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display">
              {t('landing.demo.form.title')}
            </h2>
            <span className="text-[10px] font-bold bg-blue-50 text-[#085AC0] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
              30 Phút Tư Vấn
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Điền thông tin để chuyên gia VUM chuẩn bị dữ liệu mô phỏng sát nhất với doanh nghiệp của bạn.
          </p>
        </div>

        {/* Error Alert */}
        {submissionStatus === 'error' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3" role="status" aria-live="polite">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <h3 className="font-bold">{t('landing.demo.states.errorTitle')}</h3>
              <p className="mt-0.5">{errorMessage || t('landing.demo.states.errorDescription')}</p>
              {(salesEmail || salesPhone) && (
                <div className="mt-2 flex flex-wrap gap-3 font-semibold">
                  {salesEmail && <a href={`mailto:${salesEmail}`} className="underline">{salesEmail}</a>}
                  {salesPhone && <a href={`tel:${salesPhone}`} className="underline">{salesPhone}</a>}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Row 1: Full Name & Work Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.fullName')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  className={`h-11 pl-9 text-sm bg-white border-[#E2E8F0] rounded-xl text-[#07182B] placeholder:text-slate-400 focus:border-[#085AC0] ${
                    errors.fullName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('fullName')}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workEmail" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.workEmail')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="workEmail"
                  type="email"
                  placeholder="name@company.com"
                  className={`h-11 pl-9 text-sm bg-white border-[#E2E8F0] rounded-xl text-[#07182B] placeholder:text-slate-400 focus:border-[#085AC0] ${
                    errors.workEmail ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('workEmail')}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.workEmail && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.workEmail.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.phone')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912 345 678"
                  className={`h-11 pl-9 text-sm bg-white border-[#E2E8F0] rounded-xl text-[#07182B] placeholder:text-slate-400 focus:border-[#085AC0] ${
                    errors.phone ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('phone')}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.companyName')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="companyName"
                  placeholder="Tập đoàn An Phát"
                  className={`h-11 pl-9 text-sm bg-white border-[#E2E8F0] rounded-xl text-[#07182B] placeholder:text-slate-400 focus:border-[#085AC0] ${
                    errors.companyName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('companyName')}
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.companyName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Company Size & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companySize" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.companySize')} <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="companySize"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="companySize" className="h-11 rounded-xl bg-white border-[#E2E8F0] text-sm text-[#07182B]">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDER_50">{t('landing.demo.options.sizeUnder50')}</SelectItem>
                      <SelectItem value="FROM_50_TO_199">{t('landing.demo.options.size50To199')}</SelectItem>
                      <SelectItem value="FROM_200_TO_999">{t('landing.demo.options.size200To999')}</SelectItem>
                      <SelectItem value="FROM_1000">{t('landing.demo.options.size1000Plus')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.companySize && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.companySize.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
                {t('landing.demo.form.industry')} <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="industry" className="h-11 rounded-xl bg-white border-[#E2E8F0] text-sm text-[#07182B]">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FINANCE">{t('landing.demo.options.industryFinance')}</SelectItem>
                      <SelectItem value="REAL_ESTATE">{t('landing.demo.options.industryRealEstate')}</SelectItem>
                      <SelectItem value="RETAIL_FNB">{t('landing.demo.options.industryRetailFnb')}</SelectItem>
                      <SelectItem value="MANUFACTURING_DISTRIBUTION">{t('landing.demo.options.industryManufacturing')}</SelectItem>
                      <SelectItem value="TECHNOLOGY_B2B">{t('landing.demo.options.industryTechB2b')}</SelectItem>
                      <SelectItem value="OTHER">{t('landing.demo.options.industryOther')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.industry && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.industry.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Interactive Chip Selectors for Primary Need */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-bold tracking-wider text-[#07182B] uppercase block">
              {t('landing.demo.form.primaryNeed')} <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {primaryNeedOptions.map((opt) => {
                const isSelected = selectedNeed === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('primaryNeed', opt.value, { shouldValidate: true })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#085AC0] text-[#085AC0] shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#085AC0]" />}
                  </button>
                );
              })}
            </div>
            {errors.primaryNeed && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.primaryNeed.message}</p>
            )}
          </div>

          {/* Row 5: Message / Ghi chú */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="message" className="text-xs font-bold tracking-wider text-[#07182B] uppercase">
              {t('landing.demo.form.message')} <span className="text-slate-400 font-normal lowercase">(tùy chọn)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Chia sẻ nhanh mục tiêu hoặc vấn đề doanh nghiệp bạn đang muốn giải quyết..."
              rows={2}
              className="resize-none text-sm bg-white border-[#E2E8F0] rounded-xl text-[#07182B] placeholder:text-slate-400 focus:border-[#085AC0]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.message.message}</p>
            )}
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="pt-2">
            <div className="flex items-start space-x-2.5">
              <Controller
                name="privacyConsent"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="privacyConsent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-4 w-4 rounded-md border-[#E2E8F0] data-[state=checked]:bg-[#085AC0] data-[state=checked]:border-[#085AC0] mt-0.5"
                  />
                )}
              />
              <Label
                htmlFor="privacyConsent"
                className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none font-normal"
              >
                {t('landing.demo.form.privacyConsent')}{' '}
                {privacyPolicyUrl && (
                  <a
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#085AC0] font-semibold underline hover:text-[#06499D]"
                  >
                    {t('landing.footer.privacy')}
                  </a>
                )}
              </Label>
            </div>
            {errors.privacyConsent && (
              <p className="text-xs text-rose-600 mt-1">{errors.privacyConsent.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm sm:text-base rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('landing.demo.form.submitting')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{t('landing.demo.form.submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DemoRequestForm;
