import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Layers } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { FlowStreamer } from '../../components/FlowStreamer';
import { InteractiveBentoGrid } from '../../components/InteractiveBentoGrid';
import { Reveal } from '../../components/Reveal';

export const CapabilityProofSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="proof" tone="dark" size="default" className="py-20 md:py-28 bg-[#030712]">
      {/* Top Connected Operating Streamer */}
      <Reveal>
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            {t('landing.home.proof.label')}
          </p>
          <span className="text-xs font-semibold text-slate-400">
            Zero data loss · 100% auditable lifecycle
          </span>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <FlowStreamer />
      </Reveal>

      {/* Luxury Interactive Bento Grid of Capabilities */}
      <div className="mt-20 md:mt-28">
        <Reveal delay={140}>
          <div className="mb-10 max-w-[50rem]">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400">
              Enterprise Operating Architecture
            </span>
            <h2 className="mt-3 font-extrabold text-white text-3xl sm:text-5xl tracking-tight">
              Architected for High-Velocity Revenue.
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Experience the core autonomous modules governing quotes, approvals, and territory execution.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <InteractiveBentoGrid />
        </Reveal>
      </div>
    </LandingSection>
  );
};

export default CapabilityProofSection;
