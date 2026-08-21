import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  CalendarCheck,
  Headphones
} from 'lucide-react';
import { env } from '@/config/env';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { DemoRequestForm } from '../components/DemoRequestForm';
import { AnimatedCounter } from '../components/AnimatedCounter';

export const DemoPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.demoTitle'),
    description: t('landing.metadata.demoDescription'),
    path: '/demo',
  });

  const canSubmitDemoRequest = Boolean(
    env.demoRequestEndpoint && env.privacyPolicyUrl
  );
  const hasDirectContact = Boolean(env.salesEmail || env.salesPhone);

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-[var(--landing-canvas)]">
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              {/* Kicker Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--landing-blue-soft)] border border-blue-200/80 text-[var(--landing-blue)] text-xs font-bold tracking-wide shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--landing-blue)]"></span>
                </span>
                <span className="uppercase tracking-wider font-extrabold">{t('landing.demo.heroKicker')}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[var(--landing-ink)] landing-display leading-[1.2] tracking-tight">
                {t('landing.demo.heroTitle')}
              </h1>

              <p className="text-sm sm:text-base text-[var(--landing-muted)] leading-relaxed font-normal">
                {t('landing.demo.heroDescription')}
              </p>
            </div>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-white rounded-xl border border-[var(--landing-line)] shadow-2xs text-center">
                <span className="text-[10px] font-bold text-[var(--landing-muted)] uppercase block">Query Speed</span>
                <span className="text-sm sm:text-base font-extrabold text-[var(--landing-blue)] landing-display">
                  <AnimatedCounter end={150} prefix="< " suffix="ms" duration={1200} />
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[var(--landing-line)] shadow-2xs text-center">
                <span className="text-[10px] font-bold text-[var(--landing-muted)] uppercase block">Audit Trails</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-600 landing-display">
                  <AnimatedCounter end={100} suffix="%" duration={1400} />
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[var(--landing-line)] shadow-2xs text-center">
                <span className="text-[10px] font-bold text-[var(--landing-muted)] uppercase block">Closing Velocity</span>
                <span className="text-sm sm:text-base font-extrabold text-[var(--landing-ink)] landing-display">
                  <AnimatedCounter end={3.2} decimals={1} suffix="x" duration={1300} />
                </span>
              </div>
            </div>

            {/* 4 Key Consultation Agenda Points */}
            <div className="p-5 rounded-2xl bg-white border border-[var(--landing-line)] space-y-3.5 shadow-2xs">
              <h2 className="text-xs font-bold text-[var(--landing-ink)] uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[var(--landing-blue)]" />
                Live Consultation Agenda
              </h2>
              <div className="space-y-2.5">
                {[
                  'Assess current commercial workflows and customer data flow',
                  'Interactive walkthrough of Pipelines, Quoting, and Contracts',
                  'Recommend optimal 4-tier data scoping architecture (RBAC)',
                  'Discuss data migration roadmap and deployment timeline commitments',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--landing-ink)] font-medium leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            {hasDirectContact && (
              <div className="p-4 rounded-xl bg-[var(--landing-blue-soft)] border border-[var(--landing-line)] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[var(--landing-blue)] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[var(--landing-ink)]">Need urgent technical consultation?</h2>
                  <p className="text-xs text-[var(--landing-muted)] mt-0.5">
                    {env.salesPhone && <span>Phone: <strong className="text-[var(--landing-blue)]">{env.salesPhone}</strong> • </span>}
                    {env.salesEmail && <span>Email: <strong className="text-[var(--landing-blue)]">{env.salesEmail}</strong></span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form or Contact Fallback */}
          <div className="lg:col-span-7">
            {canSubmitDemoRequest ? (
              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl!}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
              />
            ) : hasDirectContact ? (
              <div className="bg-white border border-[var(--landing-line)] rounded-2xl p-6 sm:p-10 shadow-lg space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--landing-blue)] bg-[var(--landing-blue-soft)] px-2.5 py-0.5 rounded-full uppercase">
                    Direct Contact
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--landing-ink)] landing-display">
                    {t('landing.demo.contact.title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--landing-muted)] leading-relaxed font-normal">
                    {t('landing.demo.contact.description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {env.salesEmail && (
                    <a
                      href={`mailto:${env.salesEmail}`}
                      className="flex items-center gap-3.5 p-4 rounded-xl border border-[var(--landing-line)] hover:border-[var(--landing-blue)] hover:bg-[var(--landing-blue-soft)] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[var(--landing-muted)] uppercase">
                          {t('landing.demo.contact.email')}
                        </p>
                        <p className="text-sm font-bold text-[var(--landing-ink)] truncate group-hover:text-[var(--landing-blue)]">
                          {env.salesEmail}
                        </p>
                      </div>
                    </a>
                  )}

                  {env.salesPhone && (
                    <a
                      href={`tel:${env.salesPhone}`}
                      className="flex items-center gap-3.5 p-4 rounded-xl border border-[var(--landing-line)] hover:border-[var(--landing-blue)] hover:bg-[var(--landing-blue-soft)] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[var(--landing-muted)] uppercase">
                          {t('landing.demo.contact.phone')}
                        </p>
                        <p className="text-sm font-bold text-[var(--landing-ink)] truncate group-hover:text-emerald-700">
                          {env.salesPhone}
                        </p>
                      </div>
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[var(--landing-canvas)] border border-[var(--landing-line)] flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--landing-blue)] shrink-0" />
                  <p className="text-xs text-[var(--landing-muted)] leading-relaxed">
                    VUM CRM solution architects will respond within 2 business hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[var(--landing-line)] rounded-2xl p-6 sm:p-10 shadow-lg text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-[var(--landing-blue)] mx-auto" />
                <h2 className="text-xl font-bold text-[var(--landing-ink)]">Contact Channel Updating</h2>
                <p className="text-xs sm:text-sm text-[var(--landing-muted)] max-w-md mx-auto">
                  The automated demo registration endpoint is currently under maintenance. Please visit again shortly or create a trial account.
                </p>
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--landing-blue)] text-white text-xs font-semibold hover:bg-[var(--landing-blue-hover)] transition-colors"
                  >
                    <span>Create VUM CRM Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
