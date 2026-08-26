import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { env } from '@/config/env';
import { AuthBrandPanel } from './AuthBrandPanel';
import '../auth.css';

export interface AuthShellProps {
  children: React.ReactNode;
  utilityLink?: {
    to: string;
    labelKey: string;
    direction: 'back' | 'forward';
  };
  brandVariant?: 'full' | 'compact';
}

export function AuthShell({
  children,
  utilityLink,
  brandVariant = 'full',
}: AuthShellProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="auth-theme min-h-screen py-6 sm:py-10 flex flex-col justify-between">
      {/* Accessibility Skip Link */}
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[var(--ed-accent)] text-white px-4 py-2 rounded-[8px] font-semibold text-xs"
      >
        {t('auth.gateway.common.skipToContent')}
      </a>

      {/* Top Header Utilities */}
      <div className="w-full max-w-[74rem] mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        {utilityLink ? (
          <Link
            to={utilityLink.to}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ed-secondary)] hover:text-[var(--ed-accent)] transition-colors min-h-[44px]"
          >
            {utilityLink.direction === 'back' && <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{t(utilityLink.labelKey)}</span>
            {utilityLink.direction === 'forward' && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ed-secondary)] hover:text-[var(--ed-accent)] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('auth.gateway.common.backHome')}</span>
          </Link>
        )}
      </div>

      {/* Main Form Frame */}
      <div className={brandVariant === 'compact' ? 'auth-frame auth-frame--compact' : 'auth-frame'}>
        {brandVariant === 'full' && <AuthBrandPanel />}

        <div className="auth-form-region">
          <main id="auth-main" tabIndex={-1} className="auth-form-column focus:outline-none">
            {children}
          </main>
        </div>
      </div>

      {/* Footer Legal & Copyright */}
      <footer className="w-full max-w-[74rem] mx-auto px-4 sm:px-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--ed-muted)]">
        <p translate="no">
          © {new Date().getFullYear()} {t('auth.gateway.footer.copyright')}
        </p>

        <div className="flex items-center gap-4">
          {env.termsUrl && (
            <a
              href={env.termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ed-primary)] transition-colors"
            >
              {t('auth.gateway.register.terms')}
            </a>
          )}
          {env.privacyPolicyUrl && (
            <a
              href={env.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ed-primary)] transition-colors"
            >
              {t('auth.gateway.register.privacy')}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

export default AuthShell;
