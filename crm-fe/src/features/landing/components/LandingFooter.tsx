import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { env } from '@/config/env';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#02040A] border-t border-slate-800/80 pt-20 pb-14 text-slate-400">
      <div className="landing-container">
        {/* Closing Pre-Footer Banner */}
        <div className="mb-16 flex flex-col items-start gap-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-slate-950/80 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between shadow-[0_0_50px_rgba(37,99,235,0.15)] backdrop-blur-2xl">
          <div className="max-w-[38rem]">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              Commercial Operations Excellence
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('landing.footer.ctaTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t('landing.footer.ctaDescription')}
            </p>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-3 h-12 px-8 rounded-full lp-btn-stitch text-xs font-extrabold uppercase tracking-wider shrink-0"
          >
            <span>{t('landing.footer.ctaAction')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-slate-800/80">
          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3" aria-label="VUM CRM">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                <span className="font-black text-sm tracking-tight font-mono" translate="no">V</span>
              </div>
              <span className="font-black text-lg tracking-tight text-white font-mono" translate="no">
                VUM CRM
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400 mt-1">
              {t('landing.footer.summary')}
            </p>
          </div>

          {/* Product links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
              {t('landing.footer.product')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/features" className="hover:text-cyan-400 transition-colors">{t('landing.nav.features')}</Link></li>
              <li><Link to="/solutions" className="hover:text-cyan-400 transition-colors">{t('landing.nav.solutions')}</Link></li>
              <li><Link to="/pricing" className="hover:text-cyan-400 transition-colors">{t('landing.nav.pricing')}</Link></li>
              <li><Link to="/demo" className="hover:text-cyan-400 transition-colors">{t('landing.nav.demo')}</Link></li>
            </ul>
          </div>

          {/* Contact col */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
              {t('landing.footer.contact')}
            </h3>
            <ul className="space-y-3 text-sm">
              {env.salesEmail ? (
                <li>
                  <a href={`mailto:${env.salesEmail}`} className="hover:text-cyan-400 transition-colors">
                    {env.salesEmail}
                  </a>
                </li>
              ) : null}
              {env.salesPhone ? (
                <li>
                  <a href={`tel:${env.salesPhone}`} className="hover:text-cyan-400 transition-colors">
                    {env.salesPhone}
                  </a>
                </li>
              ) : null}
              <li className="pt-2">
                <Link to="/login" className="text-cyan-400 font-bold hover:underline underline-offset-4 flex items-center gap-1">
                  <span>{t('landing.nav.login')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} {t('landing.footer.copyright')}</p>
          <div className="flex items-center gap-6">
            {env.privacyPolicyUrl && (
              <a href={env.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                {t('landing.footer.privacy')}
              </a>
            )}
            {env.termsUrl && (
              <a href={env.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
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
