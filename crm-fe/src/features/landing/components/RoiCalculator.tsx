import React, { useState } from 'react';
import { Clock, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { Button } from '@/components/ui/button';

interface TeamTier {
  size: number;
  label: string;
  hoursSavedMonth: number;
  revenueProtectedVND: number;
  cycleReductionPct: number;
  approvalMinutes: number;
}

const teamTiers: TeamTier[] = [
  {
    size: 10,
    label: '10 Sales Reps',
    hoursSavedMonth: 320,
    revenueProtectedVND: 1200,
    cycleReductionPct: 24,
    approvalMinutes: 15,
  },
  {
    size: 25,
    label: '25 Sales Reps',
    hoursSavedMonth: 800,
    revenueProtectedVND: 3500,
    cycleReductionPct: 35,
    approvalMinutes: 12,
  },
  {
    size: 50,
    label: '50 Sales Reps',
    hoursSavedMonth: 1650,
    revenueProtectedVND: 5800,
    cycleReductionPct: 38,
    approvalMinutes: 10,
  },
];

export const RoiCalculator: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<number>(25);

  const currentTier =
    teamTiers.find((tier) => tier.size === selectedSize) || teamTiers[1];

  return (
    <div className="rounded-[6px] border border-slate-800 bg-slate-950/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            Value Simulation Matrix
          </span>
          <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
            Measurable Revenue & Productivity Gains
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Real enterprise benchmark impact based on your commercial sales team scale.
          </p>
        </div>

        {/* Team Size Selector Tabs */}
        <div className="flex items-center rounded-full border border-slate-800 bg-slate-900/90 p-1.5">
          {teamTiers.map((tier) => {
            const isSelected = tier.size === selectedSize;
            return (
              <button
                key={tier.size}
                type="button"
                onClick={() => setSelectedSize(tier.size)}
                className={`rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-pressed={isSelected}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Output Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Hours Saved */}
        <div className="rounded-[4px] border border-slate-800 bg-slate-900/60 p-6 transition-all hover:bg-slate-900 hover:border-slate-700">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Time Saved
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <AnimatedCounter
              end={currentTier.hoursSavedMonth}
              className="font-mono text-4xl font-black text-white"
            />
            <span className="text-xs font-semibold text-slate-400">hrs/month</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Eliminates spreadsheet sync & redundant data re-entry
          </p>
        </div>

        {/* Metric 2: Revenue Leakage Recovered */}
        <div className="rounded-[4px] border border-slate-800 bg-slate-900/60 p-6 transition-all hover:bg-slate-900 hover:border-slate-700">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Leakage Protected
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <AnimatedCounter
              end={currentTier.revenueProtectedVND}
              prefix="~"
              suffix="M ₫"
              className="font-mono text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]"
            />
            <span className="text-xs font-semibold text-slate-400">/year</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Via automated CPQ discount governance & aging alerts
          </p>
        </div>

        {/* Metric 3: Deal Velocity Boost */}
        <div className="rounded-[4px] border border-slate-800 bg-slate-900/60 p-6 transition-all hover:bg-slate-900 hover:border-slate-700">
          <div className="flex items-center gap-2 text-purple-400">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cycle Acceleration
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <AnimatedCounter
              end={currentTier.cycleReductionPct}
              prefix="-"
              suffix="%"
              className="font-mono text-4xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]"
            />
            <span className="text-xs font-semibold text-slate-400">deal length</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Faster quote-to-close with automated approval routing
          </p>
        </div>

        {/* Metric 4: Approval Turnaround */}
        <div className="rounded-[4px] border border-slate-800 bg-slate-900/60 p-6 transition-all hover:bg-slate-900 hover:border-slate-700">
          <div className="flex items-center gap-2 text-blue-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Approval Turnaround
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <AnimatedCounter
              end={currentTier.approvalMinutes}
              prefix="< "
              suffix=" mins"
              className="font-mono text-4xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]"
            />
            <span className="text-xs font-semibold text-slate-400">vs 3 days</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            In-app 1-click approvals on mobile & desktop
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
        <span className="text-xs font-medium text-slate-500">
          * Calculated based on industry benchmarks from 120+ B2B enterprise deployments.
        </span>
        <Button asChild className="h-12 px-7 bg-blue-600 hover:bg-blue-500 text-white font-extrabold uppercase tracking-wider text-xs rounded-[4px] shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all">
          <a href="#demo">
            <span>Request Custom ROI Audit</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default RoiCalculator;
