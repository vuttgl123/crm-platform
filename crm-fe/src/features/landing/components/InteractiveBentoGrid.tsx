import React, { useState } from 'react';
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
} from 'lucide-react';

export const InteractiveBentoGrid: React.FC = () => {
  // Mini-App 1: CPQ Slider state
  const [repCount, setRepCount] = useState<number>(40);
  const basePricePerRep = 450000;

  let discountPct = 0;
  if (repCount >= 100) discountPct = 30;
  else if (repCount >= 50) discountPct = 20;
  else if (repCount >= 20) discountPct = 10;

  const rawTotal = repCount * basePricePerRep;
  const discountedTotal = Math.round(rawTotal * (1 - discountPct / 100));
  const annualSavings = Math.round(((rawTotal - discountedTotal) * 12) / 1000000);

  // Mini-App 2: 1-Click Approval state
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const handleApprove = () => {
    setIsApproved(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Bento Item 1: Interactive CPQ Dynamic Engine (Col 1-7) */}
      <div className="p-8 md:col-span-7 flex flex-col justify-between lp-stitch-glass-card rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              Interactive Simulation
            </span>
            <span className="rounded-full bg-cyan-950/80 px-3.5 py-1 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/40">
              {discountPct}% Volume Tier
            </span>
          </div>

          <h4 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            Dynamic CPQ Pricing Engine
          </h4>
          <p className="mt-1 text-sm text-slate-400">
            Slide to simulate volume discounts and annual revenue leakage protection in real time.
          </p>

          {/* Slider input */}
          <div className="mt-8 rounded-xl bg-slate-950/80 p-6 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Commercial Sales Team Scale
              </span>
              <span className="font-mono text-lg font-extrabold text-cyan-400">
                {repCount} Reps
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={repCount}
              onChange={(e) => setRepCount(Number(e.target.value))}
              className="mt-5 w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="mt-2.5 flex justify-between text-xs font-mono text-slate-500">
              <span>10 Reps</span>
              <span>50 Reps (-20%)</span>
              <span>100+ Reps (-30%)</span>
            </div>
          </div>
        </div>

        {/* Live Output Summary */}
        <div className="mt-8 flex items-baseline justify-between border-t border-slate-800/80 pt-6">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase">
              Monthly Investment
            </span>
            <span className="font-mono text-3xl font-extrabold text-white">
              {(discountedTotal / 1000000).toFixed(1)}M ₫
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </span>
          </div>

          <div className="text-right">
            <span className="block text-xs font-semibold text-emerald-400 uppercase">
              Annual Protection
            </span>
            <span className="font-mono text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              ~{annualSavings}M ₫
              <span className="text-xs font-normal text-slate-400">/yr saved</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bento Item 2: 1-Click Approval Matrix (Col 8-12) */}
      <div className="p-8 md:col-span-5 flex flex-col justify-between lp-stitch-glass-card rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              Governance Matrix
            </span>
            <span className="rounded-full bg-blue-950/80 px-3.5 py-1 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/40">
              Zero Delay
            </span>
          </div>

          <h4 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            1-Click CFO Approvals
          </h4>
          <p className="mt-1 text-sm text-slate-400">
            Accelerate deal cycles with instant cryptographic sign-offs directly from executive mobile.
          </p>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">
                Pending Deal #8492
              </span>
              <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300 border border-amber-500/40">
                15% Exception
              </span>
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-cyan-300">
              $1.25M ARR (VinTech Deployment)
            </p>

            <div className="mt-5">
              {!isApproved ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg lp-btn-stitch text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  <Zap className="h-4 w-4" />
                  <span>Execute 1-Click CFO Approval</span>
                </button>
              ) : (
                <div className="lp-fade-in flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Approved by CFO &amp; Cryptographically Locked (0.4s)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Audit Trail: Immutable Hash</span>
          <span className="font-mono text-cyan-400">#0x8F92...B41</span>
        </div>
      </div>

      {/* Bento Item 3: AI Lead Intelligence Gauge (Col 1-4) */}
      <div className="p-7 md:col-span-4 lp-stitch-glass-card rounded-2xl flex flex-col justify-between items-center text-center">
        <div className="w-full flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            Autonomous AI
          </span>
          <Sparkles className="h-4 w-4 text-cyan-400" />
        </div>

        {/* Circular Gauge */}
        <div className="my-5 relative flex h-32 w-32 items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(14,165,233,0.15)" strokeWidth="6" />
            <circle
              className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-1000"
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="#22D3EE"
              strokeDasharray="264"
              strokeDashoffset="26"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <span className="font-mono text-3xl font-black text-white">94</span>
            <span className="block font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
              VITALITY
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            Lead Vitality Scoring
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Real-time AI evaluation across 180+ intent signal vectors.
          </p>
        </div>
      </div>

      {/* Bento Item 4: Real-time Quota Attainment (Col 5-8) */}
      <div className="p-7 md:col-span-4 lp-stitch-glass-card rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            Velocity Engine
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="my-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Enterprise North</span>
              <span className="font-mono text-emerald-400">142%</span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[85%] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Strategic Accounts</span>
              <span className="font-mono text-cyan-400">118%</span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full w-[70%] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            Real-time Quota Velocity
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Instant recalculation upon quote e-signature.
          </p>
        </div>
      </div>

      {/* Bento Item 5: Compliance & Security Vault (Col 9-12) */}
      <div className="p-7 md:col-span-4 lp-stitch-glass-card rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-400">
            Security Core
          </span>
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
        </div>

        <div className="my-3 rounded-lg bg-slate-950/80 p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Field Change:</span>
            <span className="font-mono text-cyan-300">Discount &gt; 10%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Authorized By:</span>
            <span className="font-medium text-slate-200">VP Commercial</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Timestamp:</span>
            <span className="font-mono text-emerald-400">14:02:18 GMT+7</span>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            Immutable Audit Ledger
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            100% trace coverage across contracts and stage changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBentoGrid;
