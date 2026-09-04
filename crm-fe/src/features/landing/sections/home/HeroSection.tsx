import React from 'react';
import { ArrowRight, Play, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { Reveal } from '../../components/Reveal';
import { HeroCockpitPreview } from '../../components/product-ui/HeroCockpitPreview';
import { TelemetryTicker } from '../../components/TelemetryTicker';

export const HeroSection: React.FC = () => {

  return (
    <>
      <LandingSection
        id="hero"
        tone="dark"
        size="tall"
        className="relative overflow-hidden pt-28 md:pt-36 pb-20 bg-[#030712]"
      >
        {/* Google Stitch Anamorphic Lens Flare */}
        <div aria-hidden="true" className="lp-stitch-lens-flare" />

        {/* Ambient Cosmic Neon Light Rays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-32 -translate-x-1/2 h-[44rem] w-[70rem] rounded-full bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px]"
        />

        <div className="relative mx-auto flex flex-col items-center text-center max-w-[68rem] px-4">
          {/* Movie-Grade Status Kicker */}
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-5 py-2 shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-2xl transition-all hover:border-cyan-400">
              <span className="flex h-2 w-2 relative">
                <span className="lp-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
                ENTERPRISE REVENUE OS · V2.4 RELEASE
              </span>
            </div>
          </Reveal>

          {/* Masterpiece Display Headline */}
          <Reveal delay={60}>
            <h1 className="mt-8 font-black uppercase tracking-tight text-white leading-[0.95] text-5xl sm:text-7xl lg:text-8xl drop-shadow-2xl">
              THE SOVEREIGN OF <br />
              <span className="lp-stitch-title-gradient">
                REVENUE INTELLIGENCE.
              </span>
            </h1>
          </Reveal>

          {/* Epic Subtitle */}
          <Reveal delay={120}>
            <p className="mt-6 max-w-[44rem] text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              The highest-fidelity, cinematic interface tailored for revenue intelligence. Turn distributed pipelines and complex pricing approvals into predictable enterprise scale.
            </p>
          </Reveal>

          {/* Action Buttons */}
          <Reveal delay={180}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-3 h-13 px-8 rounded-full lp-btn-stitch text-sm font-extrabold uppercase tracking-wider"
              >
                <span>Initialize Executive Demo</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#proof"
                className="inline-flex items-center justify-center gap-2.5 h-13 px-7 rounded-full border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 text-sm font-semibold shadow-lg backdrop-blur-md transition-all hover:border-cyan-400"
              >
                <Play className="h-4 w-4 fill-current text-cyan-400" />
                <span>Watch Product Tour</span>
              </a>
            </div>
          </Reveal>

          {/* 3 Holographic Security Pillars */}
          <Reveal delay={220}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Single 360° Customer Record
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                &lt; 15-Minute CPQ Turnaround
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                SOC2 Type II Immutable Vault
              </span>
            </div>
          </Reveal>
        </div>

        {/* 3D Elevated Holographic Cockpit Stage */}
        <div className="relative mt-16 md:mt-20">
          <Reveal delay={260} variant="zoom-in">
            <HeroCockpitPreview />
          </Reveal>
        </div>
      </LandingSection>

      {/* Real-time Enterprise Telemetry Streamer */}
      <TelemetryTicker />
    </>
  );
};

export default HeroSection;
