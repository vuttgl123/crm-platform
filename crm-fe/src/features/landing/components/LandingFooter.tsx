import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone } from 'lucide-react';
import { env } from '@/config/env';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#DCE5F0] pt-14 pb-12 text-[#52647A]">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="VUM CRM">
              <div className="w-8 h-8 rounded-lg bg-[#07182B] flex items-center justify-center text-white">
                <span className="font-bold text-base" translate="no">V</span>
              </div>
              <span className="font-bold text-lg text-[#07182B]" translate="no">VUM CRM</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#52647A] max-w-sm">
              {t('landing.footer.summary')}
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#07182B]">
              {t('landing.footer.product')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-[#085AC0] transition-colors">
                  {t('landing.nav.features')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-[#085AC0] transition-colors">
                  {t('landing.nav.solutions')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#085AC0] transition-colors">
                  {t('landing.nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/demo" className="font-semibold text-[#085AC0] hover:underline">
                  {t('landing.nav.demo')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#07182B]">
              {t('landing.footer.contact')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {env.salesEmail ? (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${env.salesEmail}`} className="hover:text-[#085AC0]">
                    {env.salesEmail}
                  </a>
                </li>
              ) : (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>sales@vum.vn</span>
                </li>
              )}
              {env.salesPhone ? (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${env.salesPhone}`} className="hover:text-[#085AC0]">
                    {env.salesPhone}
                  </a>
                </li>
              ) : (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>1900 8899</span>
                </li>
              )}
              <li>
                <Link to="/login" className="hover:text-[#085AC0] text-xs">
                  {t('landing.nav.login')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} {t('landing.footer.copyright')}</p>
          <div className="flex items-center gap-6">
            {env.privacyPolicyUrl && (
              <a
                href={env.privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#085AC0] transition-colors"
              >
                {t('landing.footer.privacy')}
              </a>
            )}
            {env.termsUrl && (
              <a
                href={env.termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#085AC0] transition-colors"
              >
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
