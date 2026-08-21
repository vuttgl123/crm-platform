import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TFunction } from 'i18next';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { env } from '@/config/env';
import { useAuth } from '@/core/session/useAuth';
import type { LoginCredentials } from '@/types/auth';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';
import { AuthFormError } from './components/AuthFormError';
import { PasswordField } from './components/PasswordField';
import { DemoAccountPanel } from './components/DemoAccountPanel';
import { resolveReturnUrl } from './utils/resolveReturnUrl';
import {
  AuthErrorCode,
  normalizeAuthError,
  normalizeOAuthErrorCode,
} from './utils/authErrorMessages';

const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .email(t('auth.gateway.validation.email'))
      .max(320, t('auth.gateway.validation.email')),
    password: z
      .string()
      .min(1, t('auth.gateway.validation.loginPassword'))
      .max(128, t('auth.gateway.validation.loginPassword')),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
type PendingLoginAction = 'credentials' | 'GOOGLE' | 'MICROSOFT' | null;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login, loginWithSSO, clearError } = useAuth();
  const clearErrorOnMount = useRef(clearError);

  const returnUrl = resolveReturnUrl(searchParams.get('returnUrl'));
  const oauthErrorCode = normalizeOAuthErrorCode(searchParams.get('errorCode'));

  const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();
  const [pendingAction, setPendingAction] = useState<PendingLoginAction>(null);

  useEffect(() => {
    clearErrorOnMount.current();
  }, []);

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLocalErrorCode(undefined);
    setPendingAction('credentials');
    try {
      await login(values);
      navigate(returnUrl, { replace: true });
    } catch (error: unknown) {
      setLocalErrorCode(normalizeAuthError(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleSSO = async (provider: 'GOOGLE' | 'MICROSOFT') => {
    setLocalErrorCode(undefined);
    setPendingAction(provider);
    try {
      await loginWithSSO({ provider });
      if (env.useMocks) {
        navigate(returnUrl, { replace: true });
        setPendingAction(null);
      }
    } catch (error: unknown) {
      setLocalErrorCode(normalizeAuthError(error));
      setPendingAction(null);
    }
  };

  const setDemoAccount = (credentials: Required<LoginCredentials>) => {
    setValue('email', credentials.email, { shouldValidate: true });
    setValue('password', credentials.password, { shouldValidate: true });
  };

  const effectiveErrorCode = localErrorCode || oauthErrorCode;
  const isBusy = pendingAction !== null;

  return (
    <AuthShell
      utilityLink={{
        to: '/demo',
        labelKey: 'auth.gateway.common.openDemo',
        direction: 'forward',
      }}
    >
      <AuthPageHeader
        titleKey="auth.gateway.login.title"
        descriptionKey="auth.gateway.login.description"
      />

      <AuthFormError
        errorCode={effectiveErrorCode}
        fallbackMessageKey="auth.gateway.errors.unknown"
      />

      {effectiveErrorCode === 'SELF_REGISTRATION_DISABLED' && (
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-[#07182B]">
            {t('auth.gateway.login.emailLabel')}
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder={t('auth.gateway.login.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
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
            <p id="login-email-error" className="text-xs text-rose-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordField
          id="login-password"
          label={t('auth.gateway.login.passwordLabel')}
          placeholder={t('auth.gateway.login.passwordPlaceholder')}
          autoComplete="current-password"
          error={errors.password?.message}
          registration={register('password')}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isBusy}
            className="auth-control auth-interactive w-full bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {pendingAction === 'credentials' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('auth.gateway.login.submitting')}</span>
              </>
            ) : (
              <span>{t('auth.gateway.login.submit')}</span>
            )}
          </button>
        </div>

        {/* SSO Options */}
        {(env.googleSsoEnabled || env.microsoftSsoEnabled) && (
          <div className="pt-2 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DCE5F0]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">
                {t('auth.gateway.login.ssoDivider')}
              </span>
            </div>

            <div className="auth-sso-grid grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {env.googleSsoEnabled && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSSO('GOOGLE')}
                  className="auth-control auth-interactive flex items-center justify-center gap-2 border border-[#DCE5F0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#07182B] disabled:opacity-50"
                >
                  {pendingAction === 'GOOGLE' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span className="truncate">{t('auth.gateway.login.redirecting')}</span>
                    </>
                  ) : (
                    <span>{t('auth.gateway.login.google')}</span>
                  )}
                </button>
              )}

              {env.microsoftSsoEnabled && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSSO('MICROSOFT')}
                  className="auth-control auth-interactive flex items-center justify-center gap-2 border border-[#DCE5F0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#07182B] disabled:opacity-50"
                >
                  {pendingAction === 'MICROSOFT' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span className="truncate">{t('auth.gateway.login.redirecting')}</span>
                    </>
                  ) : (
                    <span>{t('auth.gateway.login.microsoft')}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Demo Account Panel (Mock mode only) */}
        {env.useMocks && (
          <DemoAccountPanel onSelect={setDemoAccount} disabled={isBusy} />
        )}

        {/* Register Account Prompt */}
        <div className="pt-3 text-center text-xs text-slate-500">
          <span>{t('auth.gateway.login.noAccount')} </span>
          <Link
            to="/register"
            className="font-semibold text-[#085AC0] hover:underline"
          >
            {t('auth.gateway.login.registerLink')}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
