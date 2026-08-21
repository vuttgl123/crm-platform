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
  headingAs?: 'h2' | 'h3';
}

const primaryNeedOptions = [
  { value: 'CUSTOMER_360' as const, labelKey: 'landing.demo.needs.CUSTOMER_360' },
  { value: 'SALES_PIPELINE' as const, labelKey: 'landing.demo.needs.SALES_PIPELINE' },
  { value: 'QUOTES_CONTRACTS' as const, labelKey: 'landing.demo.needs.QUOTES_CONTRACTS' },
  { value: 'AUTOMATION_FORECAST' as const, labelKey: 'landing.demo.needs.AUTOMATION_FORECAST' },
  { value: 'SECURITY_INTEGRATION' as const, labelKey: 'landing.demo.needs.SECURITY_INTEGRATION' },
  { value: 'OTHER' as const, labelKey: 'landing.demo.needs.OTHER' },
];

export function DemoRequestForm({
  privacyPolicyUrl,
  salesEmail,
  salesPhone,
  headingAs = 'h2',
}: DemoRequestFormProps): ReactElement {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const FormHeading = headingAs;
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
      <div className="bg-white border border-[var(--landing-line)] rounded-2xl shadow-xs overflow-hidden">
        <div className="h-1.5 bg-emerald-500 w-full" />
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <FormHeading className="text-2xl font-extrabold text-[var(--landing-ink)] landing-display">
              {t('landing.demo.states.successTitle')}
            </FormHeading>
            <p className="text-sm sm:text-base text-[var(--landing-muted)] max-w-md mx-auto leading-relaxed">
              {t('landing.demo.states.successDescription')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--landing-canvas)] border border-[var(--landing-line)] text-left max-w-md mx-auto space-y-2 text-xs text-[var(--landing-muted)]">
            <div className="font-bold text-[var(--landing-ink)] uppercase tracking-wide">
              {t('landing.demo.successNextTitle')}:
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span>{t('landing.demo.successNextContact')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>{t('landing.demo.successNextPrepare')}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setSubmissionStatus('idle')}
              variant="outline"
              className="text-xs font-semibold border-[var(--landing-line)]"
            >
              {t('landing.demo.submitAnother')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--landing-line)] rounded-2xl shadow-xs overflow-hidden">
      <div className="h-1.5 bg-[var(--landing-blue)] w-full" />
      
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <FormHeading className="text-xl sm:text-2xl font-extrabold text-[var(--landing-ink)] landing-display">
              {t('landing.demo.form.title')}
            </FormHeading>
            <span className="text-[10px] font-bold bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] px-2.5 py-0.5 rounded-full border border-[var(--landing-blue)]/20 uppercase">
              {t('landing.demo.consultationLabel')}
            </span>
          </div>
          <p className="text-xs text-[var(--landing-muted)] font-normal">
            {t('landing.demo.formIntro')}
          </p>
        </div>

        {/* Error Alert */}
        {submissionStatus === 'error' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3" role="status" aria-live="polite">
            <AlertCircle aria-hidden="true" className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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
              <Label htmlFor="fullName" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.fullName')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  placeholder={t('landing.demo.placeholders.fullName')}
                  className={`h-11 pl-9 text-sm bg-white border-[var(--landing-line)] rounded-xl text-[var(--landing-ink)] placeholder:text-slate-400 focus:border-[var(--landing-blue)] ${
                    errors.fullName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('fullName')}
                />
                <User aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workEmail" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.workEmail')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="workEmail"
                  type="email"
                  placeholder={t('landing.demo.placeholders.workEmail')}
                  className={`h-11 pl-9 text-sm bg-white border-[var(--landing-line)] rounded-xl text-[var(--landing-ink)] placeholder:text-slate-400 focus:border-[var(--landing-blue)] ${
                    errors.workEmail ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('workEmail')}
                />
                <Mail aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.workEmail && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.workEmail.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.phone')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('landing.demo.placeholders.phone')}
                  className={`h-11 pl-9 text-sm bg-white border-[var(--landing-line)] rounded-xl text-[var(--landing-ink)] placeholder:text-slate-400 focus:border-[var(--landing-blue)] ${
                    errors.phone ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('phone')}
                />
                <Phone aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.companyName')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="companyName"
                  placeholder={t('landing.demo.placeholders.companyName')}
                  className={`h-11 pl-9 text-sm bg-white border-[var(--landing-line)] rounded-xl text-[var(--landing-ink)] placeholder:text-slate-400 focus:border-[var(--landing-blue)] ${
                    errors.companyName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('companyName')}
                />
                <Building2 aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.companyName && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Company Size & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companySize" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.companySize')} <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="companySize"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="companySize" className="h-11 rounded-xl bg-white border-[var(--landing-line)] text-sm text-[var(--landing-ink)]">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
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
                <p className="text-xs text-rose-600 mt-0.5">{errors.companySize.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
                {t('landing.demo.form.industry')} <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="industry" className="h-11 rounded-xl bg-white border-[var(--landing-line)] text-sm text-[var(--landing-ink)]">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
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
                <p className="text-xs text-rose-600 mt-0.5">{errors.industry.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Interactive Chip Selectors for Primary Need */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase block">
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
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-colors flex items-center justify-between gap-1.5 min-h-[44px] ${
                      isSelected
                        ? 'bg-[var(--landing-blue-soft)] border-[var(--landing-blue)] text-[var(--landing-blue)]'
                        : 'bg-white border-[var(--landing-line)] text-[var(--landing-ink)] hover:bg-[var(--landing-canvas)]'
                    }`}
                  >
                    <span className="truncate">{t(opt.labelKey)}</span>
                    {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 shrink-0 text-[var(--landing-blue)]" />}
                  </button>
                );
              })}
            </div>
            {errors.primaryNeed && (
              <p className="text-xs text-rose-600 mt-0.5">{errors.primaryNeed.message}</p>
            )}
          </div>

          {/* Row 5: Message Notes */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="message" className="text-xs font-bold tracking-wider text-[var(--landing-ink)] uppercase">
              {t('landing.demo.form.message')} <span className="text-[var(--landing-muted)] font-normal lowercase">({t('landing.demo.optionalLabel')})</span>
            </Label>
            <Textarea
              id="message"
              placeholder={t('landing.demo.placeholders.message')}
              rows={2}
              className="resize-none text-sm bg-white border-[var(--landing-line)] rounded-xl text-[var(--landing-ink)] placeholder:text-slate-400 focus:border-[var(--landing-blue)]"
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
                    className="h-4 w-4 rounded-md border-[var(--landing-line)] data-[state=checked]:bg-[var(--landing-blue)] data-[state=checked]:border-[var(--landing-blue)] mt-0.5"
                  />
                )}
              />
              <Label
                htmlFor="privacyConsent"
                className="text-xs text-[var(--landing-muted)] leading-relaxed cursor-pointer select-none font-normal"
              >
                {t('landing.demo.form.privacyConsent')}{' '}
                {privacyPolicyUrl && (
                  <a
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--landing-blue)] font-semibold underline hover:text-[var(--landing-blue-hover)]"
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
              className="w-full h-12 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold text-sm sm:text-base rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                  {t('landing.demo.form.submitting')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{t('landing.demo.form.submit')}</span>
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
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
