import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Clock } from 'lucide-react';
import { env } from '@/config/env';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { DemoRequestForm } from '../../components/DemoRequestForm';
import { Reveal } from '../../components/Reveal';

const agendaKeys = [
  'landing.home.demo.agendaDiscovery',
  'landing.home.demo.agendaWorkflow',
  'landing.home.demo.agendaScope',
] as const;

export const DemoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="demo"
      tone="dark"
      size="tall"
      aria-labelledby="demo-title"
      className="bg-[#02040A] py-20 md:py-28"
    >
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              id="demo-title"
              tone="dark"
              eyebrow={t('landing.home.demo.eyebrow')}
              title={t('landing.home.demo.title')}
              description={t('landing.home.demo.description')}
              className="mb-8 sm:mb-8"
            />
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[6px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                {t('landing.home.demo.agendaTitle')}
              </h3>

              {/* Numbered timeline */}
              <ol className="mt-5 space-y-4">
                {agendaKeys.map((key, index) => {
                  const isLast = index === agendaKeys.length - 1;

                  return (
                    <li key={key} className="relative flex gap-3.5">
                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-[0.95rem] top-7 h-[calc(100%-0.5rem)] w-px bg-slate-800"
                        />
                      ) : null}

                      <span
                        aria-hidden="true"
                        className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-950/80 text-xs font-bold tabular-nums text-cyan-300"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="pt-0.5 text-xs font-medium leading-relaxed text-slate-300">
                        {t(key)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Reveal>

          {/* Trust Guarantees */}
          <Reveal delay={140} className="mt-6">
            <div className="flex flex-col gap-2 rounded-[6px] bg-slate-950/80 p-5 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Enterprise Confidentiality Guarantee
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Direct working session with senior solution architects. No sales pressure, structured around your organization's exact workflows.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={100}>
            <div className="rounded-[6px] border border-slate-800 bg-slate-950/90 p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative overflow-hidden">
              <div className="mb-6 border-b border-slate-800 pb-5">
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  Executive Consultation
                </span>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                  {t('landing.home.demo.formTitle')}
                </h3>
                <p className="mt-1.5 text-xs text-slate-400">
                  {t('landing.home.demo.formDescription')}
                </p>
              </div>

              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl || '/privacy'}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
                headingAs="h3"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </LandingSection>
  );
};

export default DemoSection;
