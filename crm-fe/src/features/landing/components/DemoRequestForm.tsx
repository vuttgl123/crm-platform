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
      .max(2000, t('landing.demo.validation.message'))
      .optional()
      .or(z.literal('')),
    consent: z
      .boolean()
      .refine((val) => val === true, t('landing.demo.validation.consent')),
  });

type DemoRequestFormData = z.infer<ReturnType<typeof createDemoRequestSchema>>;

export interface DemoRequestFormProps {
  headingLevel?: 'h1' | 'h2' | 'h3';
  salesEmail?: string;
  salesPhone?: string;
  onSuccess?: () => void;
}

export function DemoRequestForm({
  headingLevel = 'h2',
  salesEmail,
  salesPhone,
  onSuccess,
}: DemoRequestFormProps): ReactElement {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submittedData, setSubmittedData] = useState<DemoRequestFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const schema = createDemoRequestSchema(t);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      workEmail: '',
      phone: '',
      companyName: '',
      companySize: undefined,
      industry: undefined,
      primaryNeed: undefined,
      message: '',
      consent: false,
    },
    mode: 'onTouched',
  });

  const getUtmParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      utmContent: params.get('utm_content') || undefined,
    };
  };

  const onSubmit = async (data: DemoRequestFormData) => {
    setSubmissionStatus('submitting');
    setErrorMessage(null);

    const utm = getUtmParams();
    const payload: DemoRequestInput = {
      fullName: data.fullName,
      workEmail: data.workEmail,
      phone: data.phone,
      companyName: data.companyName,
      companySize: data.companySize as CompanySize,
      industry: data.industry as DemoIndustry,
      primaryNeed: data.primaryNeed as DemoPrimaryNeed,
      message: data.message || undefined,
      preferredLanguage: i18n.language === 'vi' ? 'vi' : 'en',
      ...utm,
    };

    try {
      await demoRequestService.submitPublicDemoRequest(payload);
      setSubmittedData(data);
      setSubmissionStatus('success');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setSubmissionStatus('error');
      if (err instanceof PublicDemoRequestError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('landing.demo.states.errorGeneric'));
      }
    }
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
    setSubmissionStatus('idle');
    setErrorMessage(null);
  };

  const FormHeading = headingLevel;

  // Options mapped from keys
  const companySizeOptions = [
    { value: 'UNDER_50', label: t('landing.demo.options.companySize.UNDER_50') },
    { value: 'FROM_50_TO_199', label: t('landing.demo.options.companySize.FROM_50_TO_199') },
    { value: 'FROM_200_TO_999', label: t('landing.demo.options.companySize.FROM_200_TO_999') },
    { value: 'FROM_1000', label: t('landing.demo.options.companySize.FROM_1000') },
  ];

  const industryOptions = [
    { value: 'FINANCE', label: t('landing.demo.options.industry.FINANCE') },
    { value: 'REAL_ESTATE', label: t('landing.demo.options.industry.REAL_ESTATE') },
    { value: 'RETAIL_FNB', label: t('landing.demo.options.industry.RETAIL_FNB') },
    { value: 'MANUFACTURING_DISTRIBUTION', label: t('landing.demo.options.industry.MANUFACTURING_DISTRIBUTION') },
    { value: 'TECHNOLOGY_B2B', label: t('landing.demo.options.industry.TECHNOLOGY_B2B') },
    { value: 'OTHER', label: t('landing.demo.options.industry.OTHER') },
  ];

  const primaryNeedOptions = [
    { value: 'CUSTOMER_360', label: t('landing.demo.options.primaryNeed.CUSTOMER_360') },
    { value: 'SALES_PIPELINE', label: t('landing.demo.options.primaryNeed.SALES_PIPELINE') },
    { value: 'QUOTES_CONTRACTS', label: t('landing.demo.options.primaryNeed.QUOTES_CONTRACTS') },
    { value: 'AUTOMATION_FORECAST', label: t('landing.demo.options.primaryNeed.AUTOMATION_FORECAST') },
    { value: 'SECURITY_INTEGRATION', label: t('landing.demo.options.primaryNeed.SECURITY_INTEGRATION') },
    { value: 'OTHER', label: t('landing.demo.options.primaryNeed.OTHER') },
  ];

  if (submissionStatus === 'success' && submittedData) {
    return (
      <div 
        className="lp-stitch-glass-card rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-cyan-500/40 text-center space-y-6"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <FormHeading className="text-2xl font-black text-white tracking-tight">
            {t('landing.demo.states.successTitle')}
          </FormHeading>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {t('landing.demo.states.successSubtitle')}
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">{t('landing.demo.form.fullName')}:</span>
            <span className="font-bold text-white">{submittedData.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">{t('landing.demo.form.workEmail')}:</span>
            <span className="font-bold text-cyan-300">{submittedData.workEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t('landing.demo.form.companyName')}:</span>
            <span className="font-bold text-white">{submittedData.companyName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {t('landing.demo.states.successTimeline')}
        </p>

        <Button
          type="button"
          onClick={handleReset}
          className="lp-btn-stitch text-white font-extrabold uppercase tracking-wider text-xs px-6 py-2.5 rounded-full"
        >
          {t('landing.demo.states.sendAnother')}
        </Button>
      </div>
    );
  }

  return (
    <div className="lp-stitch-glass-card rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 w-full" />
      
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <FormHeading className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('landing.demo.form.title')}
            </FormHeading>
            <span className="text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 uppercase">
              {t('landing.demo.consultationLabel')}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            {t('landing.demo.formIntro')}
          </p>
        </div>

        {/* Error Alert */}
        {submissionStatus === 'error' && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3" role="status" aria-live="polite">
            <AlertCircle aria-hidden="true" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <h3 className="font-bold">{t('landing.demo.states.errorTitle')}</h3>
              <p className="mt-0.5">{errorMessage || t('landing.demo.states.errorDescription')}</p>
              {(salesEmail || salesPhone) && (
                <div className="mt-2 flex flex-wrap gap-3 font-semibold">
                  {salesEmail && <a href={`mailto:${salesEmail}`} className="underline text-rose-300">{salesEmail}</a>}
                  {salesPhone && <a href={`tel:${salesPhone}`} className="underline text-rose-300">{salesPhone}</a>}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Row 1: Full Name & Work Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.fullName')} <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  placeholder={t('landing.demo.placeholders.fullName')}
                  className={`h-11 pl-9 text-sm bg-slate-900/90 border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                    errors.fullName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('fullName')}
                />
                <User aria-hidden="true" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workEmail" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.workEmail')} <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="workEmail"
                  type="email"
                  placeholder={t('landing.demo.placeholders.workEmail')}
                  className={`h-11 pl-9 text-sm bg-slate-900/90 border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                    errors.workEmail ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('workEmail')}
                />
                <Mail aria-hidden="true" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.workEmail && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.workEmail.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.phone')} <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('landing.demo.placeholders.phone')}
                  className={`h-11 pl-9 text-sm bg-slate-900/90 border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                    errors.phone ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('phone')}
                />
                <Phone aria-hidden="true" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.companyName')} <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="companyName"
                  placeholder={t('landing.demo.placeholders.companyName')}
                  className={`h-11 pl-9 text-sm bg-slate-900/90 border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                    errors.companyName ? 'border-rose-400 focus-visible:ring-rose-500' : ''
                  }`}
                  {...register('companyName')}
                />
                <Building2 aria-hidden="true" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.companyName && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Company Size & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companySize" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.companySize')} <span className="text-rose-400">*</span>
              </Label>
              <Controller
                name="companySize"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="companySize" className="h-11 rounded-lg bg-slate-900/90 border-slate-700 text-sm text-white">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {companySizeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-slate-800 focus:text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.companySize && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.companySize.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.industry')} <span className="text-rose-400">*</span>
              </Label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="industry" className="h-11 rounded-lg bg-slate-900/90 border-slate-700 text-sm text-white">
                      <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {industryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-slate-800 focus:text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.industry && (
                <p className="text-xs text-rose-400 mt-0.5">{errors.industry.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Primary Need */}
          <div className="space-y-1.5">
            <Label htmlFor="primaryNeed" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
              {t('landing.demo.form.primaryNeed')} <span className="text-rose-400">*</span>
            </Label>
            <Controller
              name="primaryNeed"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="primaryNeed" className="h-11 rounded-lg bg-slate-900/90 border-slate-700 text-sm text-white">
                    <SelectValue placeholder={t('landing.demo.form.selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {primaryNeedOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="focus:bg-slate-800 focus:text-white">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.primaryNeed && (
              <p className="text-xs text-rose-400 mt-0.5">{errors.primaryNeed.message}</p>
            )}
          </div>

          {/* Row 5: Optional Message */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="message" className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('landing.demo.form.message')}
              </Label>
              <span className="text-[10px] text-slate-500 font-mono">
                {t('landing.demo.form.optional')}
              </span>
            </div>
            <Textarea
              id="message"
              rows={3}
              placeholder={t('landing.demo.placeholders.message')}
              className={`text-sm bg-slate-900/90 border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 ${
                errors.message ? 'border-rose-400 focus-visible:ring-rose-500' : ''
              }`}
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-rose-400 mt-0.5">{errors.message.message}</p>
            )}
          </div>

          {/* Row 6: Consent Checkbox */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-3">
              <Controller
                name="consent"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="consent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 rounded border-slate-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                )}
              />
              <Label
                htmlFor="consent"
                className="text-xs text-slate-400 leading-relaxed font-normal cursor-pointer"
              >
                {t('landing.demo.form.consentText')} <span className="text-rose-400">*</span>
              </Label>
            </div>
            {errors.consent && (
              <p className="text-xs text-rose-400 mt-0.5">{errors.consent.message}</p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 lp-btn-stitch text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-[0_0_25px_rgba(14,165,233,0.4)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>{t('landing.demo.form.submitting')}</span>
                </>
              ) : (
                <>
                  <span>{t('landing.demo.form.submit')}</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-cyan-200" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DemoRequestForm;
