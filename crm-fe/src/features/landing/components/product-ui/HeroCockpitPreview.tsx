import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Filter,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { MockWindow } from './MockWindow';
import { MockPipelineBoard } from './MockPipelineBoard';

interface DealFilter {
  id: string;
  label: string;
  count: number;
  total: string;
}

const dealFilters: DealFilter[] = [
  { id: 'all', label: '🔥 All Pipelines', count: 26, total: '14.6B ₫' },
  { id: 'enterprise', label: '⚡ Enterprise Tier', count: 8, total: '8.4B ₫' },
  { id: 'approvals', label: '🛡️ CFO Vault', count: 5, total: '3.9B ₫' },
];

export const HeroCockpitPreview: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<{
    name: string;
    stage: string;
    amount: string;
    owner: string;
    probability: string;
  } | null>(null);

  const handleSimulateSelectDeal = () => {
    setSelectedDeal({
      name: 'VinTech Enterprise Cloud Deployment',
      stage: 'QUALIFICATION',
      amount: '2.45B ₫',
      owner: 'Tran Mai Anh (VP Sales)',
      probability: '75%',
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-[70rem]">
      {/* Dynamic Laser Border Beam Container */}
      <div className="lp-border-beam rounded-[12px] p-[1.5px] shadow-[0_0_50px_rgba(37,99,235,0.3)]">
        {/* Main Dark Holographic Cockpit Frame */}
        <div className="lp-border-beam-content rounded-[11px] bg-slate-950/90 backdrop-blur-2xl transition-all duration-300">
          {/* Cockpit Status Sub-Header Bar */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 px-5 py-3.5 sm:flex-row sm:items-center">
            {/* Status Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="lp-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
                CYBERNETIC COCKPIT HUD
              </span>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300 border border-blue-500/30">
                LIVE TELEMETRY
              </span>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {dealFilters.map((filter) => {
                const isSelected = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`rounded-[4px] px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span>{filter.label}</span>
                    <span className="ml-1.5 font-mono opacity-80">({filter.total})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cockpit Frame & Mock Window content */}
          <div className="relative cursor-pointer bg-slate-950 p-4 sm:p-6" onClick={handleSimulateSelectDeal}>
            <MockPipelineBoard />

            {/* Bottom Hint Banner */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                <span>Interactive Pipeline: Click any deal card to inspect live telemetry</span>
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                IMMUTABLE SOC2 LEDGER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Deal Detail Popover Modal */}
      {selectedDeal && (
        <div className="lp-fade-in absolute inset-x-6 top-16 z-30 mx-auto max-w-md rounded-[6px] border border-blue-500/50 bg-slate-950/95 p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:inset-x-auto sm:right-8 sm:w-84">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="rounded-full bg-blue-900/60 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300 border border-blue-700/60">
                {selectedDeal.stage}
              </span>
              <h4 className="mt-1.5 text-sm font-bold text-white">
                {selectedDeal.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeal(null);
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Deal Value:</span>
              <span className="font-mono font-bold text-white text-sm">{selectedDeal.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Win Probability:</span>
              <span className="font-mono font-bold text-emerald-400">{selectedDeal.probability}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Owner:</span>
              <span className="font-medium text-slate-300">{selectedDeal.owner}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Autonomous SLA:</span>
              <span className="font-mono text-cyan-400 font-bold">&lt; 4m Approval</span>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Floating Widget 1: Top-Right ARR Velocity */}
      <div
        aria-hidden="true"
        className="lp-animate-float absolute -top-6 -right-4 z-20 hidden rounded-[6px] border border-slate-700/80 bg-slate-900/90 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl lg:block xl:-right-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                +38.4% QoQ Growth
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="font-mono text-xs text-emerald-300 tabular-nums mt-0.5">
              $1.42M ARR unlocked
            </p>
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="mt-3 flex items-end gap-1.5 h-6 pt-1">
          {[35, 42, 38, 55, 60, 52, 70, 85, 98].map((h, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-t-[1px] ${
                i === 8 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-800/60'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Satellite Floating Widget 2: Bottom-Left Instant CPQ Approved */}
      <div
        aria-hidden="true"
        className="lp-animate-float-slow absolute -bottom-6 -left-4 z-20 hidden rounded-[6px] border border-slate-700/80 bg-slate-900/90 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl lg:block xl:-left-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-blue-950/80 border border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Quote #VUM-8924 Approved
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                1-Click
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              1.25B ₫ · Approved in <strong className="text-cyan-400 font-mono font-bold">4 mins</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCockpitPreview;
