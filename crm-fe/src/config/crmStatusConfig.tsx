import { Badge } from '@/components/ui/badge';
import { AccountLifecycleStage, AccountType } from '@/services/api/accountApi';
import { Building, GitCommit } from 'lucide-react';

/**
 * System-Wide Color Palette & Badge Configuration for CRM Entities
 */

export interface StatusBadgeConfig {
  label: string;
  className: string;
  priorityLevel: number; // 1 = Highest Priority (Customer), 5 = Lowest
}

export const LifecycleStageConfigMap: Record<AccountLifecycleStage, StatusBadgeConfig> = {
  PROSPECT: {
    label: 'PROSPECT',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
    priorityLevel: 3,
  },
  QUALIFIED: {
    label: 'QUALIFIED',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
    priorityLevel: 2,
  },
  CUSTOMER: {
    label: 'CUSTOMER',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    priorityLevel: 1,
  },
  INACTIVE: {
    label: 'INACTIVE',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    priorityLevel: 4,
  },
  CHURNED: {
    label: 'CHURNED',
    className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    priorityLevel: 5,
  },
};

export const AccountTypeConfigMap: Record<AccountType, { label: string; className: string }> = {
  ORGANIZATION: {
    label: 'ENTERPRISE',
    className: 'bg-[#DEEBFF] text-[#0747A6] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
  PERSON: {
    label: 'INDIVIDUAL',
    className: 'bg-[#EBECF0] text-[#42526E] border-0 font-semibold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
  PARTNER: {
    label: 'PARTNER',
    className: 'bg-[#E3FCEF] text-[#006644] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
  RESELLER: {
    label: 'RESELLER',
    className: 'bg-[#FFFAE6] text-[#974F0C] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
  SUPPLIER: {
    label: 'SUPPLIER',
    className: 'bg-[#FFEBE6] text-[#DE350B] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
};

export const LeadStatusConfigMap: Record<string, StatusBadgeConfig> = {
  NEW: {
    label: 'NEW',
    className: 'bg-[#EAE6FF] text-[#403294] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  CONTACTED: {
    label: 'CONTACTED',
    className: 'bg-[#DEEBFF] text-[#0747A6] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  QUALIFIED: {
    label: 'QUALIFIED',
    className: 'bg-[#E3FCEF] text-[#006644] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  CONVERTED: {
    label: 'CONVERTED',
    className: 'bg-[#EAE6FF] text-[#403294] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  UNQUALIFIED: {
    label: 'UNQUALIFIED',
    className: 'bg-[#FFEBE6] text-[#DE350B] border-0 font-semibold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
};

export const OpportunityStageConfigMap: Record<string, StatusBadgeConfig> = {
  PROSPECTING: {
    label: 'PROSPECTING',
    className: 'bg-[#EAE6FF] text-[#403294] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  QUALIFICATION: {
    label: 'QUALIFICATION',
    className: 'bg-[#DEEBFF] text-[#0747A6] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  PROPOSAL: {
    label: 'PROPOSAL',
    className: 'bg-[#DEEBFF] text-[#0747A6] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  NEGOTIATION: {
    label: 'NEGOTIATION',
    className: 'bg-[#FFFAE6] text-[#974F0C] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  CLOSED_WON: {
    label: 'CLOSED WON',
    className: 'bg-[#E3FCEF] text-[#006644] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
  CLOSED_LOST: {
    label: 'CLOSED LOST',
    className: 'bg-[#FFEBE6] text-[#DE350B] border-0 font-semibold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 6,
  },
};

export const PriorityConfigMap: Record<string, StatusBadgeConfig> = {
  HIGH: {
    label: 'HIGH',
    className: 'bg-[#FFEBE6] text-[#DE350B] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  MEDIUM: {
    label: 'MEDIUM',
    className: 'bg-[#FFFAE6] text-[#974F0C] border-0 font-semibold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  LOW: {
    label: 'LOW',
    className: 'bg-[#EBECF0] text-[#42526E] border-0 font-medium rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
};

/** Helper function to render uniform system lifecycle stage badge */
export const renderLifecycleStageBadge = (stage?: AccountLifecycleStage) => {
  if (!stage) return null;
  const config = LifecycleStageConfigMap[stage];
  if (!config) return <Badge variant="outline">{stage}</Badge>;

  const dotColor =
    stage === 'CUSTOMER'
      ? 'bg-emerald-500'
      : stage === 'QUALIFIED'
      ? 'bg-blue-500'
      : stage === 'PROSPECT'
      ? 'bg-purple-500'
      : stage === 'INACTIVE'
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <Badge variant="outline" className={`${config.className} inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] shadow-2xs`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{config.label}</span>
    </Badge>
  );
};

/** Helper function to render uniform system account type badge */
export const renderAccountTypeBadge = (type?: AccountType) => {
  if (!type) return null;
  const config = AccountTypeConfigMap[type];
  if (!config) return <Badge variant="outline">{type}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Lead status badge */
export const renderLeadStatusBadge = (status?: string) => {
  if (!status) return null;
  const config = LeadStatusConfigMap[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Opportunity stage badge */
export const renderOpportunityStageBadge = (stage?: string) => {
  if (!stage) return null;
  const config = OpportunityStageConfigMap[stage];
  if (!config) return <Badge variant="outline">{stage}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Priority badge */
export const renderPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  const config = PriorityConfigMap[priority];
  if (!config) return <Badge variant="outline">{priority}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render root account badge */
export const renderRootAccountBadge = () => (
  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold gap-1 px-2 py-0.5">
    <Building className="w-3 h-3 text-indigo-600" />
    <span>PARENT ORG</span>
  </Badge>
);

/** Helper function to render child account count badge */
export const renderChildCountBadge = (count: number) => (
  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-semibold px-2 py-0.5">
    {count} {count === 1 ? 'Subsidiary' : 'Subsidiaries'}
  </Badge>
);

/** Helper function to render branch/child unit badge */
export const renderBranchUnitBadge = () => (
  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-medium gap-1 px-2 py-0.5">
    <GitCommit className="w-3 h-3 text-slate-400" />
    <span>Subsidiary Unit</span>
  </Badge>
);
