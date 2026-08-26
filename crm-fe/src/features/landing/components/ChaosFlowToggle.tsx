import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export const ChaosFlowToggle: React.FC = () => {
  const [isFlowMode, setIsFlowMode] = useState<boolean>(true);

  return (
    <div className="w-full">
      {/* Sci-Fi Pill Switcher */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950 p-2 shadow-[0_0_25px_rgba(0,0,0,0.9)]">
          <button
            type="button"
            onClick={() => setIsFlowMode(false)}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all ${
              !isFlowMode
                ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Legacy Fragmented CRM</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlowMode(true)}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all ${
              isFlowMode
                ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.7)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>VUM Autonomous Flow</span>
          </button>
        </div>
      </div>

      {/* Main Comparative Presentation Card */}
      {isFlowMode ? (
        <SpotlightCard
          tone="dark"
          className="lp-fade-in border-blue-500/50 bg-slate-900/90 p-8 md:p-12 shadow-[0_0_50px_rgba(37,99,235,0.2)] backdrop-blur-2xl"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
                Operating Equilibrium
              </span>
              <h3 className="mt-1 text-3xl font-extrabold text-white tracking-tight">
                Autonomous Revenue Operations
              </h3>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              100% Connected Workflow
            </span>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-l-2 border-cyan-400 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Approval SLA
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-white">
                &lt; 15 Mins
              </p>
              <p className="mt-1 text-xs text-slate-400">
                1-Click in-app sign-offs on mobile
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Unification
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-white">
                100% 360°
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Zero spreadsheet copy-paste
              </p>
            </div>

            <div className="border-l-2 border-emerald-400 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deal Leakage
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
                0% Loss
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Automated stale deal alerts
              </p>
            </div>

            <div className="border-l-2 border-indigo-400 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Forecast Accuracy
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-white">
                98% True
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Stage-weighted velocity tracking
              </p>
            </div>
          </div>
        </SpotlightCard>
      ) : (
        <SpotlightCard
          tone="dark"
          className="lp-fade-in border-rose-500/50 bg-slate-900/90 p-8 md:p-12 shadow-[0_0_50px_rgba(225,29,72,0.2)] backdrop-blur-2xl"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
                Operational Friction
              </span>
              <h3 className="mt-1 text-3xl font-extrabold text-white tracking-tight">
                Fragmented Legacy CRM Setup
              </h3>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-rose-950/90 border border-rose-500/40 px-4 py-1.5 text-xs font-bold text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              High Revenue Drag
            </span>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-l-2 border-rose-500 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Approval Lag
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-rose-400">
                3 - 5 Days
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Lost discount context & email trails
              </p>
            </div>

            <div className="border-l-2 border-rose-500 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Fragmentation
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-rose-400">
                4+ Excels
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Reps maintain disjointed personal sheets
              </p>
            </div>

            <div className="border-l-2 border-rose-500 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deal Leakage
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-rose-400">
                42% Stalled
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Cold opportunities go unnoticed
              </p>
            </div>

            <div className="border-l-2 border-rose-500 pl-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Forecasting
              </span>
              <p className="mt-2 font-mono text-4xl font-black text-rose-400">
                Blind Guess
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Manual weekly spreadsheet rollups
              </p>
            </div>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
};

export default ChaosFlowToggle;
