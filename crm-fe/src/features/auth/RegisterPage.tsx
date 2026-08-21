import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { User, Mail, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { env } from '@/config/env';
import { useAuth } from '@/core/session/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';
import { AuthFormError } from './components/AuthFormError';
import { PasswordField } from './components/PasswordField';
import {
  AuthErrorCode,
  normalizeAuthError,
} from './utils/authErrorMessages';

const createRegisterSchema = (t: TFunction) =>
  z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t('auth.gateway.validation.fullName'))
      .max(255, t('auth.gateway.validation.fullName')),
    email: z
      .string()
      .trim()
      .email(t('auth.gateway.validation.email'))
      .max(320, t('auth.gateway.validation.email')),
    password: z
      .string()
      .min(12, t('auth.gateway.validation.registerPassword'))
      .max(128, t('auth.gateway.validation.registerPassword')),
    tenantCode: z
      .string()
      .trim()
      .min(1, t('auth.gateway.validation.tenantCode'))
      .max(320, t('auth.gateway.validation.tenantCode')),
    legalConsent: z.boolean().refine(Boolean, {
      message: t('auth.gateway.validation.legalConsent'),
    }),
  });

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { register: registerUser, clearError, session } = useAuth();
  const clearErrorOnMount = useRef(clearError);
  const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();

  useEffect(() => {
    clearErrorOnMount.current();
  }, []);

  const schema = useMemo(() => createRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      tenantCode: '',
      legalConsent: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLocalErrorCode(undefined);
    try {
      const returnedSession = await registerUser({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        tenantCode: values.tenantCode,
      });
      const isPending =
        returnedSession.membership?.membership_status === 'INVITED' &&
        returnedSession.membership?.is_tenant_admin !== true;
      navigate(isPending ? '/app/pending-approval' : '/app/overview', {
        replace: true,
      });
    } catch (error: unknown) {
      setLocalErrorCode(normalizeAuthError(error));
    }
  };

  const isInvitedSession =
    session?.membership?.membership_status === 'INVITED' &&
    session?.membership?.is_tenant_admin !== true;

  return (
    <AuthShell
      utilityLink={{
        to: '/login',
        labelKey: 'auth.gateway.common.openLogin',
        direction: 'back',
      }}
    >
      <AuthPageHeader
        titleKey="auth.gateway.register.title"
        descriptionKey="auth.gateway.register.description"
      />

      <AuthFormError
        errorCode={localErrorCode}
        fallbackMessageKey="auth.gateway.errors.unknown"
      />

      {localErrorCode === 'SELF_REGISTRATION_DISABLED' && (
        <div className="mb-4 text-left">
          <Link
            to="/demo"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#085AC0] hover:underline"
          >
            <span>{t('auth.gateway.common.openDemo')}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {localErrorCode === 'EMAIL_ALREADY_REGISTERED' && (
        <div className="mb-4 text-left">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#085AC0] hover:underline"
          >
            <span>{t('auth.gateway.common.openLogin')}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {localErrorCode === 'MEMBERSHIP_REQUEST_ALREADY_PENDING' && isInvitedSession && (
        <div className="mb-4 text-left">
          <Link
            to="/app/pending-approval"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#085AC0] hover:underline"
          >
            <span>{t('auth.gateway.pending.title')}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="text-xs font-semibold text-[#07182B]">
            {t('auth.gateway.register.fullNameLabel')}
          </label>
          <div className="relative">
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder={t('auth.gateway.register.fullNamePlaceholder')}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? 'register-name-error' : undefined}
              className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pl-10 text-sm text-[#07182B] placeholder:text-slate-400 focus-visible:border-[#085AC0] ${
                errors.displayName ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-[#DCE5F0]'
              }`}
              {...register('displayName')}
            />
            <User
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
          {errors.displayName && (
            <p id="register-name-error" className="text-xs text-rose-600 mt-1">
              {errors.displayName.message}
            </p>
          )}
        </div>

        {/* Work Email */}
        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-xs font-semibold text-[#07182B]">
            {t('auth.gateway.register.emailLabel')}
          </label>
          <div className="relative">
            <input
              id="register-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder={t('auth.gateway.register.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pl-10 text-sm text-[#07182B] placeholder:text-slate-400 focus-visible:border-[#085AC0] ${
                errors.email ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-[#DCE5F0]'
              }`}
              {...register('email')}
            />
            <Mail
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
          {errors.email && (
            <p id="register-email-error" className="text-xs text-rose-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Tenant Code */}
        <div className="space-y-1.5">
          <label htmlFor="register-tenant" className="text-xs font-semibold text-[#07182B]">
            {t('auth.gateway.register.tenantCodeLabel')}
          </label>
          <div className="relative">
            <input
              id="register-tenant"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={t('auth.gateway.register.tenantCodePlaceholder')}
              aria-invalid={Boolean(errors.tenantCode)}
              aria-describedby={
                errors.tenantCode
                  ? 'register-tenant-error'
                  : 'register-tenant-help'
              }
              className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pl-10 text-sm text-[#07182B] placeholder:text-slate-400 focus-visible:border-[#085AC0] ${
                errors.tenantCode ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-[#DCE5F0]'
              }`}
              {...register('tenantCode')}
            />
            <Building2
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
          {errors.tenantCode ? (
            <p id="register-tenant-error" className="text-xs text-rose-600 mt-1">
              {errors.tenantCode.message}
            </p>
          ) : (
            <p id="register-tenant-help" className="text-xs text-slate-500 mt-1">
              {t('auth.gateway.register.tenantCodeHelper')}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordField
          id="register-password"
          label={t('auth.gateway.register.passwordLabel')}
          placeholder={t('auth.gateway.register.passwordPlaceholder')}
          autoComplete="new-password"
          error={errors.password?.message}
          helperText={t('auth.gateway.register.passwordHelper')}
          registration={register('password')}
        />

        {/* Legal Consent Checkbox */}
        <div className="pt-2">
          <div className="flex items-start gap-2.5">
            <Controller
              control={control}
              name="legalConsent"
              render={({ field }) => (
                <Checkbox
                  id="legalConsent"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={Boolean(errors.legalConsent)}
                  aria-describedby={errors.legalConsent ? 'legalConsent-error' : undefined}
                  className="mt-0.5 border-[#DCE5F0] data-[state=checked]:bg-[#085AC0] data-[state=checked]:border-[#085AC0]"
                />
              )}
            />
            <label
              htmlFor="legalConsent"
              className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none font-normal"
            >
              {t('auth.gateway.register.consentPrefix')}{' '}
              {env.termsUrl ? (
                <a
                  href={env.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#085AC0] font-semibold underline hover:text-[#06499D]"
                >
                  {t('auth.gateway.register.terms')}
                </a>
              ) : (
                <span className="font-semibold text-slate-700">{t('auth.gateway.register.terms')}</span>
              )}{' '}
              {t('auth.gateway.register.connector')}{' '}
              {env.privacyPolicyUrl ? (
                <a
                  href={env.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#085AC0] font-semibold underline hover:text-[#06499D]"
                >
                  {t('auth.gateway.register.privacy')}
                </a>
              ) : (
                <span className="font-semibold text-slate-700">{t('auth.gateway.register.privacy')}</span>
              )}{' '}
              {t('auth.gateway.register.consentSuffix')}
            </label>
          </div>
          {errors.legalConsent && (
            <p id="legalConsent-error" className="text-xs text-rose-600 mt-1">
              {errors.legalConsent.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-control auth-interactive w-full bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('auth.gateway.register.submitting')}</span>
              </>
            ) : (
              <span>{t('auth.gateway.register.submit')}</span>
            )}
          </button>
        </div>

        {/* Already Have Account */}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>{t('auth.gateway.register.hasAccount')} </span>
          <Link
            to="/login"
            className="font-semibold text-[#085AC0] hover:underline"
          >
            {t('auth.gateway.register.loginLink')}
          </Link>
        </div>

        {/* New Organization Help */}
        <div className="pt-3 border-t border-[#DCE5F0] text-center text-xs text-slate-500">
          <span>{t('auth.gateway.register.organizationHelp')} </span>
          <Link
            to="/demo"
            className="font-semibold text-[#085AC0] hover:underline"
          >
            {t('auth.gateway.register.demoLink')}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
