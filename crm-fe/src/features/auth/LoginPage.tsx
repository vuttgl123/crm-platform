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
  extractLockedUntil,
  normalizeAuthError,
  normalizeOAuthErrorCode,
} from './utils/authErrorMessages';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

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
  const [lockedUntil, setLockedUntil] = useState<string>();
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
      setLockedUntil(extractLockedUntil(error));
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
      setLockedUntil(extractLockedUntil(error));
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
        messageKeyOverride={
          effectiveErrorCode === 'ACCOUNT_LOCKED' && lockedUntil
            ? 'auth.gateway.errors.accountLockedUntil'
            : undefined
        }
        messageValues={
          effectiveErrorCode === 'ACCOUNT_LOCKED' && lockedUntil
            ? {
                // Formatted here, in the browser: only it knows the viewer's
                // timezone and locale. The server sends an ISO instant.
                time: new Date(lockedUntil).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : undefined
        }
      />

      {effectiveErrorCode === 'ACCOUNT_LOCKED' && (
        <div className="mb-4 text-left">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--auth-blue)] hover:underline"
          >
            <span>{t('auth.gateway.login.unlockViaReset')}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {effectiveErrorCode === 'SELF_REGISTRATION_DISABLED' && (
        <div className="mb-4 text-left">
          <Link
            to="/demo"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--auth-blue)] hover:underline"
          >
            <span>{t('auth.gateway.common.openDemo')}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-[var(--auth-ink)]">
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
              className={`auth-control auth-interactive flex w-full border bg-white px-3.5 pl-10 text-sm text-[var(--auth-ink)] placeholder:text-slate-400 focus-visible:border-[var(--auth-blue)] ${
                errors.email ? 'border-rose-400 focus-visible:ring-rose-500' : 'border-[var(--auth-line)]'
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

        {/* Without this link the recovery flow exists but nobody can find it. */}
        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[var(--auth-blue)] hover:underline underline-offset-4"
          >
            {t('auth.gateway.login.forgotPassword')}
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isBusy}
            className="auth-control auth-interactive w-full bg-[var(--auth-blue)] hover:bg-[var(--auth-blue-hover)] text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
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
                <div className="w-full border-t border-[var(--auth-line)]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-[var(--auth-muted)] uppercase">
                {t('auth.gateway.login.ssoDivider')}
              </span>
            </div>

            <div className="auth-sso-grid grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {env.googleSsoEnabled && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSSO('GOOGLE')}
                  className="auth-control auth-interactive flex items-center justify-center gap-2 border border-[var(--auth-line)] bg-white hover:bg-[var(--auth-canvas)] text-xs font-semibold text-[var(--auth-ink)] disabled:opacity-50"
                >
                  {pendingAction === 'GOOGLE' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span className="truncate">{t('auth.gateway.login.redirecting')}</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>{t('auth.gateway.login.google')}</span>
                    </>
                  )}
                </button>
              )}

              {env.microsoftSsoEnabled && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSSO('MICROSOFT')}
                  className="auth-control auth-interactive flex items-center justify-center gap-2 border border-[var(--auth-line)] bg-white hover:bg-[var(--auth-canvas)] text-xs font-semibold text-[var(--auth-ink)] disabled:opacity-50"
                >
                  {pendingAction === 'MICROSOFT' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span className="truncate">{t('auth.gateway.login.redirecting')}</span>
                    </>
                  ) : (
                    <>
                      <MicrosoftIcon />
                      <span>{t('auth.gateway.login.microsoft')}</span>
                    </>
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
        <div className="pt-3 text-center text-xs text-[var(--auth-muted)]">
          <span>{t('auth.gateway.login.noAccount')} </span>
          <Link
            to="/register"
            className="font-semibold text-[var(--auth-blue)] hover:underline"
          >
            {t('auth.gateway.login.registerLink')}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
