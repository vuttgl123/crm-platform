import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { Mail, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
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
      // A network failure is worth showing. Every other outcome is
      // deliberately indistinguishable, so the screen advances regardless —
      // the server itself answers 202 whether or not the account exists.
      const code = normalizeAuthError(error);
      if (code === 'NETWORK_ERROR') {
        setLocalErrorCode(code);
        return;
      }
    }
    setSubmittedEmail(email);
    setSubmitted(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const onSubmit = (values: ForgotFormValues) => send(values.email);

  if (submitted) {
    return (
      <AuthShell brandVariant="compact">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--auth-blue-soft)] text-[var(--auth-blue)]">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
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
              className="text-xs font-semibold text-[var(--auth-blue)] hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {cooldown > 0
                ? t('auth.gateway.forgot.resendIn', { seconds: cooldown })
                : t('auth.gateway.forgot.resend')}
            </button>

            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--auth-muted)] hover:text-[var(--auth-ink)]"
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
      <AuthPageHeader
        titleKey="auth.gateway.forgot.title"
        descriptionKey="auth.gateway.forgot.description"
      />

      <AuthFormError
        errorCode={localErrorCode}
        fallbackMessageKey="auth.gateway.errors.unknown"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 text-left"
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="text-xs font-semibold text-[var(--auth-ink)]"
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
              className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pl-10 text-sm text-[var(--auth-ink)] placeholder:text-slate-400 focus-visible:border-[var(--auth-blue)] ${
                errors.email
                  ? 'border-rose-400 focus-visible:ring-rose-500'
                  : 'border-[var(--auth-line)]'
              }`}
              {...register('email')}
            />
            <Mail
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          </div>
          {errors.email && (
            <p id="forgot-email-error" className="mt-1 text-xs text-rose-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-control auth-interactive flex w-full items-center justify-center gap-2 bg-[var(--auth-blue)] text-sm font-semibold text-white hover:bg-[var(--auth-blue-hover)] disabled:opacity-70"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          <span>{t('auth.gateway.forgot.submit')}</span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--auth-muted)] hover:text-[var(--auth-ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t('auth.gateway.forgot.backToLogin')}</span>
        </Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
