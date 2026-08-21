import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--landing-surface)] border-t border-[var(--landing-line)] pt-16 pb-12 text-[var(--landing-muted)]">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[var(--landing-line)]">
          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2.5" aria-label="VUM CRM">
              <div className="w-8 h-8 rounded-lg bg-[var(--landing-ink)] flex items-center justify-center text-white shadow-xs">
                <span className="font-bold text-base tracking-tight" translate="no">V</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-[var(--landing-ink)] leading-none" translate="no">
                VUM CRM
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-[var(--landing-muted)]">
              {t('landing.footer.summary')}
            </p>
          </div>

          {/* Product links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--landing-ink)]">
              {t('landing.footer.product')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/features" className="hover:text-[var(--landing-blue)] transition-colors">{t('landing.nav.features')}</Link></li>
              <li><Link to="/solutions" className="hover:text-[var(--landing-blue)] transition-colors">{t('landing.nav.solutions')}</Link></li>
              <li><Link to="/pricing" className="hover:text-[var(--landing-blue)] transition-colors">{t('landing.nav.pricing')}</Link></li>
              <li><Link to="/demo" className="hover:text-[var(--landing-blue)] transition-colors">{t('landing.nav.demo')}</Link></li>
            </ul>
          </div>

          {/* Contact col */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--landing-ink)]">
              {t('landing.footer.contact')}
            </h3>
            <ul className="space-y-3 text-sm">
              {env.salesEmail ? (
                <li>
                  <a href={`mailto:${env.salesEmail}`} className="hover:text-[var(--landing-blue)] transition-colors">
                    {env.salesEmail}
                  </a>
                </li>
              ) : null}
              {env.salesPhone ? (
                <li>
                  <a href={`tel:${env.salesPhone}`} className="hover:text-[var(--landing-blue)] transition-colors">
                    {env.salesPhone}
                  </a>
                </li>
              ) : null}
              <li className="pt-2">
                <Link to="/login" className="text-[var(--landing-blue)] font-semibold hover:underline underline-offset-4">
                  {t('landing.nav.login')} →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--landing-muted)]">
          <p>© {currentYear} {t('landing.footer.copyright')}</p>
          <div className="flex items-center gap-6">
            {env.privacyPolicyUrl && (
              <a href={env.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--landing-blue)] transition-colors">
                {t('landing.footer.privacy')}
              </a>
            )}
            {env.termsUrl && (
              <a href={env.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--landing-blue)] transition-colors">
                {t('landing.footer.terms')}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
