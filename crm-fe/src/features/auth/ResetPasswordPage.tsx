import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { ArrowLeft, Loader2, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';
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
      toast.success(t('auth.resetSuccess'), {
        description: t('auth.loginWithNewPassword'),
      });
      navigate('/login?reset=1', { replace: true });
    } catch (error) {
      setLocalErrorCode(normalizeAuthError(error));
    }
  };

  const isExpired = localErrorCode === 'PASSWORD_RESET_TOKEN_EXPIRED';
  const isInvalid = !token || localErrorCode === 'PASSWORD_RESET_TOKEN_INVALID';

  if (isExpired || isInvalid) {
    return (
      <AuthShell brandVariant="compact">
        <div className="text-center auth-stagger-1">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]">
            {isExpired ? (
              <Clock className="h-7 w-7" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
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
                className="w-full h-11 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-[0_1px_2px_rgba(29,78,216,0.2)] flex items-center justify-center transition-all"
              >
                {t('auth.gateway.reset.requestNew')}
              </Link>
            )}
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
          titleKey="auth.gateway.reset.title"
          descriptionKey="auth.gateway.reset.description"
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
          className="w-full h-11 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-[0_1px_2px_rgba(29,78,216,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
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
