import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Users,
  GitBranch,
  FileCheck,
  FileSignature,
  type LucideIcon,
} from 'lucide-react';

interface FlowNode {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  badge: string;
  metric: string;
}

const flowNodes: FlowNode[] = [
  {
    id: 'lead',
    labelKey: 'landing.home.proof.customerData',
    icon: Database,
    badge: '01. Neural Ingestion',
    metric: '< 0.4s Sync',
  },
  {
    id: 'account',
    labelKey: 'landing.home.workflow.accountLabel',
    icon: Users,
    badge: '02. Account 360°',
    metric: 'Real-time Matrix',
  },
  {
    id: 'pipeline',
    labelKey: 'landing.home.proof.pipeline',
    icon: GitBranch,
    badge: '03. Pipeline Control',
    metric: '+28% Velocity',
  },
  {
    id: 'quote',
    labelKey: 'landing.home.proof.quotes',
    icon: FileCheck,
    badge: '04. CPQ Governance',
    metric: '1-Click Lock',
  },
  {
    id: 'contract',
    labelKey: 'landing.home.proof.contracts',
    icon: FileSignature,
    badge: '05. Contract Vault',
    metric: '100% Immutable',
  },
];

export const FlowStreamer: React.FC = () => {
  const { t } = useTranslation();
  const [activeNode, setActiveNode] = useState<string>('pipeline');

  return (
    <div className="w-full">
      {/* Sleek Horizontal Cyber Flow Highway */}
      <div className="relative rounded-[6px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:p-8">
        {/* Animated Neon Laser Highway */}
        <div
          aria-hidden="true"
          className="absolute left-16 right-16 top-[4.25rem] hidden h-0.5 bg-slate-800 md:block"
        >
          <div className="lp-flow-pulse-particle" />
        </div>

        <ul
          aria-label={t('landing.home.proof.flowLabel')}
          className="relative grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-4"
        >
          {flowNodes.map((node) => {
            const Icon = node.icon;
            const isActive = activeNode === node.id;

            return (
              <li key={node.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveNode(node.id)}
                  onMouseEnter={() => setActiveNode(node.id)}
                  className={`group flex w-full flex-col items-center rounded-[6px] p-5 text-center transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-950/80 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      : 'bg-slate-900/40 border border-transparent hover:bg-slate-900/80 hover:border-slate-800'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Step Metric Pill */}
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold font-mono ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {node.metric}
                  </span>

                  {/* Icon Circle */}
                  <div
                    className={`relative z-10 my-4 flex h-13 w-13 items-center justify-center rounded-full border transition-all duration-300 group-hover:scale-110 ${
                      isActive
                        ? 'border-cyan-400 bg-blue-600 text-white shadow-[0_0_25px_rgba(34,211,238,0.6)]'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="lp-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400" />
                      </span>
                    )}
                  </div>

                  {/* Node Label */}
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {node.badge}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FlowStreamer;
