import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { ArrowLeft, Loader2, ShieldAlert, Clock } from 'lucide-react';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';
import { AuthFormError } from './components/AuthFormError';
import { PasswordField } from './components/PasswordField';
import { PasswordStrengthMeter } from './components/PasswordStrengthMeter';
import { confirmPasswordReset } from './services/passwordResetService';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from './utils/passwordPolicy';
import { AuthErrorCode, normalizeAuthError } from './utils/authErrorMessages';

const createSchema = (t: TFunction) =>
  z
    .object({
      newPassword: z
        .string()
        .min(PASSWORD_MIN_LENGTH, t('auth.gateway.validation.registerPassword'))
        .max(PASSWORD_MAX_LENGTH, t('auth.gateway.validation.registerPassword')),
      confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.gateway.reset.mismatch'),
    });

type ResetFormValues = z.infer<ReturnType<typeof createSchema>>;

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetFormValues) => {
    setLocalErrorCode(undefined);
    try {
      await confirmPasswordReset(token, values.newPassword);
      navigate('/login?reset=1', { replace: true });
    } catch (error) {
      setLocalErrorCode(normalizeAuthError(error));
    }
  };

  // An expired link is a distinct state from an invalid one, because only the
  // first is worth offering a fresh link for. That is the entire reason the
  // backend reports the two with separate error codes.
  const isExpired = localErrorCode === 'PASSWORD_RESET_TOKEN_EXPIRED';
  const isInvalid = !token || localErrorCode === 'PASSWORD_RESET_TOKEN_INVALID';

  if (isExpired || isInvalid) {
    return (
      <AuthShell brandVariant="compact">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            {isExpired ? (
              <Clock className="h-6 w-6" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            )}
          </div>

          <AuthPageHeader
            titleKey={
              isExpired
                ? 'auth.gateway.reset.expiredTitle'
                : 'auth.gateway.reset.invalidTitle'
            }
            descriptionKey={
              isExpired
                ? 'auth.gateway.reset.expiredDescription'
                : 'auth.gateway.reset.invalidDescription'
            }
          />

          <div className="mt-6 flex flex-col items-center gap-3">
            {isExpired && (
              <Link
                to="/forgot-password"
                className="auth-control auth-interactive inline-flex w-full items-center justify-center bg-[var(--auth-blue)] text-sm font-semibold text-white hover:bg-[var(--auth-blue-hover)]"
              >
                {t('auth.gateway.reset.requestNew')}
              </Link>
            )}
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
        titleKey="auth.gateway.reset.title"
        descriptionKey="auth.gateway.reset.description"
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
        <div>
          <PasswordField
            id="reset-new-password"
            label={t('auth.gateway.reset.newPassword')}
            placeholder={t('auth.gateway.reset.newPasswordPlaceholder')}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            registration={register('newPassword')}
          />
          <PasswordStrengthMeter password={watch('newPassword') ?? ''} />
        </div>

        <PasswordField
          id="reset-confirm-password"
          label={t('auth.gateway.reset.confirmPassword')}
          placeholder={t('auth.gateway.reset.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          registration={register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-control auth-interactive flex w-full items-center justify-center gap-2 bg-[var(--auth-blue)] text-sm font-semibold text-white hover:bg-[var(--auth-blue-hover)] disabled:opacity-70"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          <span>{t('auth.gateway.reset.submit')}</span>
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
