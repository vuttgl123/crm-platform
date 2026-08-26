import React from 'react';
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileSignature,
} from 'lucide-react';

interface TelemetryEvent {
  id: string;
  icon: React.ElementType;
  text: string;
  badge: string;
  badgeColor: string;
  time: string;
}

const telemetryEvents: TelemetryEvent[] = [
  {
    id: '1',
    icon: Zap,
    text: 'Lead (VinTech Corp) scored 96/100 · Auto-routed to North Enterprise Team',
    badge: 'Neural Ingestion',
    badgeColor: 'bg-blue-950 text-cyan-300 border-blue-500/40',
    time: '0.4s ago',
  },
  {
    id: '2',
    icon: FileSignature,
    text: 'Quote #Q-8924 (1.25B ₫) signed via e-Signature by CFO',
    badge: '1-Click CPQ',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
    time: '12s ago',
  },
  {
    id: '3',
    icon: TrendingUp,
    text: 'Deal #OP-4401 moved to CLOSED-WON · 3.2B ₫ unlocked',
    badge: 'Pipeline Win',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    time: '45s ago',
  },
  {
    id: '4',
    icon: CheckCircle2,
    text: 'Discount exception (15%) auto-approved by Governance Rule Matrix',
    badge: 'Approval SLA',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
    time: '1m ago',
  },
  {
    id: '5',
    icon: ShieldCheck,
    text: 'Immutable Audit Vault: 120 field-level state changes logged',
    badge: 'SOC2 Ready',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    time: '2m ago',
  },
  {
    id: '6',
    icon: Building2,
    text: 'Mega Account hierarchy synced: 14 subsidiaries under parent entity',
    badge: 'Customer 360°',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
    time: '4m ago',
  },
];

export const TelemetryTicker: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl py-3 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {/* Left/Right soft gradient fade masks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#02040A] via-[#02040A]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#02040A] via-[#02040A]/80 to-transparent"
      />

      <div className="flex items-center">
        {/* Live Pulse Label */}
        <div className="z-20 flex shrink-0 items-center gap-2.5 pl-6 pr-8 bg-slate-950/95 border-r border-slate-800 py-1">
          <span className="flex h-2 w-2 relative">
            <span className="lp-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
            LIVE TELEMETRY
          </span>
        </div>

        {/* Marquee Track */}
        <div className="lp-ticker-track flex items-center gap-8 pl-8">
          {[...telemetryEvents, ...telemetryEvents].map((event, idx) => {
            const Icon = event.icon;
            return (
              <div
                key={`${event.id}-${idx}`}
                className="flex items-center gap-3 shrink-0 rounded-[4px] border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs shadow-md backdrop-blur-md"
              >
                <Icon className="h-4 w-4 text-cyan-400" />
                <span className="font-medium text-slate-200">{event.text}</span>
                <span
                  className={`rounded-[3px] border px-2 py-0.5 font-mono text-[9px] font-bold ${event.badgeColor}`}
                >
                  {event.badge}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {event.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TelemetryTicker;
