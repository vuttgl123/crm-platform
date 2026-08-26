import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { realAuthService } from '@/services/api/RealAuthService';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';

export const AuthCallbackPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    realAuthService
      .handleOAuth2Callback()
      .then(() => {
        if (active) {
          navigate('/app/overview', { replace: true });
        }
      })
      .catch(() => {
        if (!active) return;
        setHasError(true);
        redirectTimer = setTimeout(() => {
          navigate('/login?errorCode=OAUTH2_LOGIN_FAILED', { replace: true });
        }, 2000);
      });

    return () => {
      active = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [navigate]);

  if (hasError) {
    return (
      <AuthShell brandVariant="compact">
        <AuthPageHeader
          titleKey="auth.gateway.callback.errorTitle"
          descriptionKey="auth.gateway.callback.errorDescription"
        />

        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </div>

          <p className="text-[13px] text-[#78716C] font-normal">
            {t('auth.gateway.callback.redirecting')}
          </p>

          <div className="pt-2">
            <Link
              to="/login?errorCode=OAUTH2_LOGIN_FAILED"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('auth.gateway.callback.returnLogin')}</span>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell brandVariant="compact">
      <AuthPageHeader
        titleKey="auth.gateway.callback.title"
        descriptionKey="auth.gateway.callback.loadingDescription"
      />

      <div
        className="py-8 flex flex-col items-center justify-center gap-4 text-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-9 h-9 text-[#1D4ED8] animate-spin" aria-hidden="true" />
        <p className="text-[14px] text-[#57534E] font-medium">
          {t('auth.gateway.callback.loadingDescription')}
        </p>
      </div>
    </AuthShell>
  );
};

export default AuthCallbackPage;
