import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { Mail, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';
import { AuthFormError } from './components/AuthFormError';
import { requestPasswordReset } from './services/passwordResetService';
import { AuthErrorCode, normalizeAuthError } from './utils/authErrorMessages';

const RESEND_COOLDOWN_SECONDS = 60;

const createSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .email(t('auth.gateway.validation.email'))
      .max(320, t('auth.gateway.validation.email')),
  });

type ForgotFormValues = z.infer<ReturnType<typeof createSchema>>;

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const send = async (email: string) => {
    setLocalErrorCode(undefined);
    try {
      await requestPasswordReset(email);
    } catch (error) {
      const code = normalizeAuthError(error);
      if (code === 'NETWORK_ERROR') {
        setLocalErrorCode(code);
        return;
      }
    }
    setSubmittedEmail(email);
    setSubmitted(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success(t('auth.resetLinkSent'), {
      description: t('auth.checkInbox'),
    });
  };

  const onSubmit = (values: ForgotFormValues) => send(values.email);

  if (submitted) {
    return (
      <AuthShell brandVariant="compact">
        <div className="text-center auth-stagger-1">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>

          <AuthPageHeader
            titleKey="auth.gateway.forgot.sentTitle"
            descriptionKey="auth.gateway.forgot.sentDescription"
            descriptionValues={{ email: submittedEmail }}
          />

          <AuthFormError
            errorCode={localErrorCode}
            fallbackMessageKey="auth.gateway.errors.unknown"
          />

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={() => send(submittedEmail)}
              className="text-[13px] font-semibold text-[#1D4ED8] hover:underline disabled:cursor-not-allowed disabled:text-[#A8A29E] disabled:no-underline"
            >
              {cooldown > 0
                ? t('auth.gateway.forgot.resendIn', { seconds: cooldown })
                : t('auth.gateway.forgot.resend')}
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('auth.gateway.forgot.backToLogin')}</span>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell brandVariant="compact">
      <div className="auth-stagger-1">
        <AuthPageHeader
          titleKey="auth.gateway.forgot.title"
          descriptionKey="auth.gateway.forgot.description"
        />

        <AuthFormError
          errorCode={localErrorCode}
          fallbackMessageKey="auth.gateway.errors.unknown"
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 text-left auth-stagger-2"
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block text-[13px] font-semibold text-[#1C1917]"
          >
            {t('auth.gateway.login.emailLabel')}
          </label>
          <div className="relative">
            <input
              id="forgot-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoFocus
              placeholder={t('auth.gateway.login.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              className={`flex w-full h-11 border bg-white px-3.5 pl-10 text-[14px] text-[#1C1917] rounded-[6px] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all ${
                errors.email
                  ? 'border-[#FECACA] bg-[#FEF2F2]/30 focus:ring-[#B91C1C]'
                  : 'border-[#E7E5E4]'
              }`}
              {...register('email')}
            />
            <Mail
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
              aria-hidden="true"
            />
          </div>
          {errors.email && (
            <p id="forgot-email-error" className="mt-1 text-[12px] text-[#B91C1C] font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-[0_1px_2px_rgba(29,78,216,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          <span>{t('auth.gateway.forgot.submit')}</span>
        </button>
      </form>

      <div className="mt-6 text-center auth-stagger-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t('auth.gateway.forgot.backToLogin')}</span>
        </Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
