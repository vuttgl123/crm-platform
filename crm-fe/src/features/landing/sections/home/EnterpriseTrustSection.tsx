import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  LockKeyhole,
  Network,
  PlugZap,
  Shield,
  Activity,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Reveal } from '../../components/Reveal';
import { SpotlightCard } from '../../components/SpotlightCard';
import {
  enterpriseTrustItems,
  type EnterpriseTrustId,
} from '../../content/homeContent';

const trustIcons = {
  access: LockKeyhole,
  scope: Network,
  audit: History,
  integration: PlugZap,
} satisfies Record<EnterpriseTrustId, LucideIcon>;

export const EnterpriseTrustSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="solutions"
      tone="dark"
      size="tall"
      aria-labelledby="trust-title"
      className="relative overflow-hidden bg-[#030712] py-20 md:py-28"
    >
      {/* Subtle Luminous Aurora Mesh in Background */}
      <div
        aria-hidden="true"
        className="lp-aurora-glow pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 h-[36rem] w-[50rem] rounded-full bg-blue-600/10 blur-[140px]"
      />

      <SectionHeading
        id="trust-title"
        tone="dark"
        eyebrow={t('landing.home.trust.eyebrow')}
        title={t('landing.home.trust.title')}
      />

      {/* 4 Obsidian Security Spotlight Feature Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {enterpriseTrustItems.map((item, index) => {
          const Icon = trustIcons[item.id];

          return (
            <Reveal key={item.id} delay={index * 70}>
              <SpotlightCard
                tone="dark"
                className="group relative flex h-full flex-col p-8 bg-slate-900/60 border-slate-800/80 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-blue-500/30 bg-blue-950/60 text-blue-400 shadow-inner transition-transform group-hover:scale-105">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold tracking-wider text-blue-400/80 uppercase">
                    Security 0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                  {t(item.titleKey)}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {t(item.descriptionKey)}
                </p>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>

      {/* Enterprise SLA Trust Banner */}
      <Reveal delay={300} className="mt-10">
        <div className="flex flex-wrap items-center justify-around gap-6 rounded-[4px] border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <Shield className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-white">Role-Level Governance</p>
              <p className="text-xs text-slate-400">Multi-tenant & scope isolation</p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-slate-800 md:block" />

          <div className="flex items-center gap-3.5">
            <Activity className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-bold text-white">99.99% Availability SLA</p>
              <p className="text-xs text-slate-400">Disaster recovery & redundancy</p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-slate-800 md:block" />

          <div className="flex items-center gap-3.5">
            <Server className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-bold text-white">&lt; 50ms Edge API Latency</p>
              <p className="text-xs text-slate-400">Sub-second query response</p>
            </div>
          </div>
        </div>
      </Reveal>
    </LandingSection>
  );
};

export default EnterpriseTrustSection;
