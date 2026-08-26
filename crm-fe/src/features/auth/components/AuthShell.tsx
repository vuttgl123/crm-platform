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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#1D4ED8] text-white px-4 py-2 rounded-[6px] font-semibold text-xs shadow-md"
      >
        {t('auth.gateway.common.skipToContent')}
      </a>

      {/* Top Header Navigation */}
      <header className="w-full max-w-[72rem] mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
        {/* Left: Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#57534E] hover:text-[#1D4ED8] transition-colors py-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          <span>{t('auth.gateway.common.backHome')}</span>
        </Link>

        {/* Right: Optional Utility Link only when explicitly passed */}
        {utilityLink && (
          <Link
            to={utilityLink.to}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors py-2"
          >
            {utilityLink.direction === 'back' && <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{t(utilityLink.labelKey)}</span>
            {utilityLink.direction === 'forward' && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          </Link>
        )}
      </header>

      {/* Main Unified Split Frame */}
      <div className={brandVariant === 'compact' ? 'auth-frame auth-frame--compact' : 'auth-frame'}>
        {brandVariant === 'full' && <AuthBrandPanel />}

        <div className="auth-form-region">
          <main id="auth-main" tabIndex={-1} className="auth-form-column focus:outline-none">
            {children}
          </main>
        </div>
      </div>

      {/* Footer Legal & Copyright */}
      <footer className="w-full max-w-[72rem] mx-auto px-4 sm:px-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#A8A29E]">
        <p>
          © {new Date().getFullYear()} VUM CRM Platform. {t('auth.gateway.footer.copyright', 'All rights reserved.')}
        </p>

        <div className="flex items-center gap-4">
          {env.termsUrl ? (
            <a
              href={env.termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1D4ED8] transition-colors"
            >
              {t('auth.gateway.register.terms')}
            </a>
          ) : (
            <Link to="/#faq" className="hover:text-[#1D4ED8] transition-colors">
              {t('auth.gateway.register.terms')}
            </Link>
          )}

          {env.privacyPolicyUrl ? (
            <a
              href={env.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1D4ED8] transition-colors"
            >
              {t('auth.gateway.register.privacy')}
            </a>
          ) : (
            <Link to="/#security" className="hover:text-[#1D4ED8] transition-colors">
              {t('auth.gateway.register.privacy')}
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

export default AuthShell;
