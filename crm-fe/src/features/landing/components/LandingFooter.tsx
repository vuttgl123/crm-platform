import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[--color-dark] border-t border-[--color-dark-border] pt-16 pb-12 text-[--color-dark-muted]">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[--color-dark-border]">
          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3" aria-label="VUM CRM">
              <div className="w-8 h-8 bg-white flex items-center justify-center text-[--color-dark]">
                <span className="font-black text-lg leading-none" translate="no">V</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-white leading-none" translate="no">
                VUM CRM
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-xs">
              {t('landing.footer.summary')}
            </p>
          </div>

          {/* Product links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-[13px] font-semibold text-white">
              {t('landing.footer.product')}
            </h3>
            <ul className="space-y-3 text-[14px]">
              <li><Link to="/features" className="hover:text-white transition-colors">{t('landing.nav.features')}</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">{t('landing.nav.solutions')}</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">{t('landing.nav.pricing')}</Link></li>
              <li><Link to="/demo" className="hover:text-white transition-colors">{t('landing.nav.demo')}</Link></li>
            </ul>
          </div>

          {/* Contact col */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-[13px] font-semibold text-white">
              {t('landing.footer.contact')}
            </h3>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a href={`mailto:${env.salesEmail || 'sales@vum.vn'}`} className="hover:text-white transition-colors">
                  {env.salesEmail || 'sales@vum.vn'}
                </a>
              </li>
              <li>
                <a href={`tel:${env.salesPhone || '19008899'}`} className="hover:text-white transition-colors">
                  {env.salesPhone || '1900 8899'}
                </a>
              </li>
              <li className="pt-2">
                <Link to="/login" className="text-white font-medium hover:underline underline-offset-4">
                  {t('landing.nav.login')} →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[13px]">
          <p>© {currentYear} {t('landing.footer.copyright')}</p>
          <div className="flex items-center gap-6">
            {env.privacyPolicyUrl && (
              <a href={env.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {t('landing.footer.privacy')}
              </a>
            )}
            {env.termsUrl && (
              <a href={env.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
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
