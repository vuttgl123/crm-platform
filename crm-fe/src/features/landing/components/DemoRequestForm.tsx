import { useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      workEmail: '',
      phone: '',
      companyName: '',
      message: '',
      privacyConsent: false,
    },
  });

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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 landing-display">
          {t('landing.demo.form.title')}
        </h2>
      </div>

      <div role="status" aria-live="polite">
        {submissionStatus === 'success' && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-900">
                {t('landing.demo.states.successTitle')}
              </h3>
              <p className="text-sm text-emerald-700 mt-1">
                {t('landing.demo.states.successDescription')}
              </p>
            </div>
          </div>
        )}

        {submissionStatus === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-900">
                {t('landing.demo.states.errorTitle')}
              </h3>
              <p className="text-sm text-rose-700 mt-1">
                {errorMessage || t('landing.demo.states.errorDescription')}
              </p>
              {(salesEmail || salesPhone) && (
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-rose-800">
                  {salesEmail && (
                    <a href={`mailto:${salesEmail}`} className="underline hover:text-rose-950">
                      {salesEmail}
                    </a>
                  )}
                  {salesPhone && (
                    <a href={`tel:${salesPhone}`} className="underline hover:text-rose-950">
                      {salesPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.fullName')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="fullName"
              {...register('fullName')}
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              aria-invalid={Boolean(errors.fullName)}
              className={errors.fullName ? 'border-rose-300 focus-visible:ring-rose-500' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workEmail" className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.workEmail')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="workEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              {...register('workEmail')}
              placeholder="name@company.com"
              aria-invalid={Boolean(errors.workEmail)}
              className={errors.workEmail ? 'border-rose-300 focus-visible:ring-rose-500' : ''}
            />
            {errors.workEmail && (
              <p className="text-xs text-rose-600">{errors.workEmail.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.phone')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...register('phone')}
              placeholder="0912 345 678"
              aria-invalid={Boolean(errors.phone)}
              className={errors.phone ? 'border-rose-300 focus-visible:ring-rose-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-rose-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.companyName')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="companyName"
              {...register('companyName')}
              autoComplete="organization"
              placeholder="Tên doanh nghiệp"
              aria-invalid={Boolean(errors.companyName)}
              className={errors.companyName ? 'border-rose-300 focus-visible:ring-rose-500' : ''}
            />
            {errors.companyName && (
              <p className="text-xs text-rose-600">{errors.companyName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.companySize')} <span className="text-rose-500">*</span>
            </Label>
            <Controller
              name="companySize"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.companySize ? 'border-rose-300' : ''}
                    aria-invalid={Boolean(errors.companySize)}
                  >
                    <SelectValue placeholder={t('landing.demo.form.companySize')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNDER_50">{t('landing.demo.companySizes.UNDER_50')}</SelectItem>
                    <SelectItem value="FROM_50_TO_199">{t('landing.demo.companySizes.FROM_50_TO_199')}</SelectItem>
                    <SelectItem value="FROM_200_TO_999">{t('landing.demo.companySizes.FROM_200_TO_999')}</SelectItem>
                    <SelectItem value="FROM_1000">{t('landing.demo.companySizes.FROM_1000')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.companySize && (
              <p className="text-xs text-rose-600">{errors.companySize.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.industry')} <span className="text-rose-500">*</span>
            </Label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.industry ? 'border-rose-300' : ''}
                    aria-invalid={Boolean(errors.industry)}
                  >
                    <SelectValue placeholder={t('landing.demo.form.industry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINANCE">{t('landing.demo.industries.FINANCE')}</SelectItem>
                    <SelectItem value="REAL_ESTATE">{t('landing.demo.industries.REAL_ESTATE')}</SelectItem>
                    <SelectItem value="RETAIL_FNB">{t('landing.demo.industries.RETAIL_FNB')}</SelectItem>
                    <SelectItem value="MANUFACTURING_DISTRIBUTION">{t('landing.demo.industries.MANUFACTURING_DISTRIBUTION')}</SelectItem>
                    <SelectItem value="TECHNOLOGY_B2B">{t('landing.demo.industries.TECHNOLOGY_B2B')}</SelectItem>
                    <SelectItem value="OTHER">{t('landing.demo.industries.OTHER')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.industry && (
              <p className="text-xs text-rose-600">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              {t('landing.demo.form.primaryNeed')} <span className="text-rose-500">*</span>
            </Label>
            <Controller
              name="primaryNeed"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.primaryNeed ? 'border-rose-300' : ''}
                    aria-invalid={Boolean(errors.primaryNeed)}
                  >
                    <SelectValue placeholder={t('landing.demo.form.primaryNeed')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER_360">{t('landing.demo.needs.CUSTOMER_360')}</SelectItem>
                    <SelectItem value="SALES_PIPELINE">{t('landing.demo.needs.SALES_PIPELINE')}</SelectItem>
                    <SelectItem value="QUOTES_CONTRACTS">{t('landing.demo.needs.QUOTES_CONTRACTS')}</SelectItem>
                    <SelectItem value="AUTOMATION_FORECAST">{t('landing.demo.needs.AUTOMATION_FORECAST')}</SelectItem>
                    <SelectItem value="SECURITY_INTEGRATION">{t('landing.demo.needs.SECURITY_INTEGRATION')}</SelectItem>
                    <SelectItem value="OTHER">{t('landing.demo.needs.OTHER')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.primaryNeed && (
              <p className="text-xs text-rose-600">{errors.primaryNeed.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-sm font-medium text-slate-700">
            {t('landing.demo.form.message')}
          </Label>
          <Textarea
            id="message"
            {...register('message')}
            rows={3}
            maxLength={1000}
            placeholder="Chia sẻ ngắn gọn về quy trình bán hàng hoặc bài toán cần giải quyết..."
          />
          {errors.message && (
            <p className="text-xs text-rose-600">{errors.message.message}</p>
          )}
        </div>

        <div className="pt-2">
          <div className="flex items-start gap-2.5">
            <Controller
              name="privacyConsent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="privacyConsent"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                  aria-invalid={Boolean(errors.privacyConsent)}
                />
              )}
            />
            <Label
              htmlFor="privacyConsent"
              className="text-xs text-slate-600 leading-relaxed cursor-pointer"
            >
              {t('landing.demo.form.privacyConsent')}{' '}
              {privacyPolicyUrl && (
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
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

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm shadow-sm transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('landing.demo.form.submitting')}
              </span>
            ) : (
              t('landing.demo.form.submit')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default DemoRequestForm;
