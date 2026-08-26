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
    label: 'ORGANIZATION',
    className: 'bg-[#DEEBFF] text-[#0747A6] border-0 font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5',
  },
  PERSON: {
    label: 'PERSON',
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

export const OpportunityStatusConfigMap: Record<string, StatusBadgeConfig> = {
  OPEN: {
    label: 'OPEN',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  WON: {
    label: 'CLOSED WON',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  LOST: {
    label: 'CLOSED LOST',
    className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  CANCELLED: {
    label: 'CANCELLED',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
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

/** Helper function to render Opportunity status badge */
export const renderOpportunityStatusBadge = (status?: string) => {
  if (!status) return null;
  const config = OpportunityStatusConfigMap[status];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{status}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Opportunity stage badge */
export const renderOpportunityStageBadge = (stageName?: string, category?: string) => {
  if (!stageName) return null;
  const config = OpportunityStageConfigMap[stageName];
  if (config) {
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  }
  let colorClass = 'bg-[#DEEBFF] text-[#0747A6] border-blue-200';
  const upper = stageName.toUpperCase();
  if (category === 'WON' || upper.includes('WON')) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (category === 'LOST' || upper.includes('LOST')) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (upper.includes('PROSPECT') || upper.includes('DISCOVERY')) {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (upper.includes('NEGOTIAT')) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return (
    <Badge
      variant="outline"
      className={`${colorClass} font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5`}
    >
      {stageName}
    </Badge>
  );
};

export const ActivityStatusConfigMap: Record<string, StatusBadgeConfig> = {
  PLANNED: {
    label: 'PLANNED',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  COMPLETED: {
    label: 'COMPLETED',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  DEFERRED: {
    label: 'DEFERRED',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  CANCELLED: {
    label: 'CANCELLED',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
};

export const ActivityPriorityConfigMap: Record<string, StatusBadgeConfig> = {
  URGENT: {
    label: 'URGENT',
    className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  HIGH: {
    label: 'HIGH',
    className: 'bg-orange-50 text-orange-700 border-orange-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  NORMAL: {
    label: 'NORMAL',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  LOW: {
    label: 'LOW',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
};

export const ActivityTypeConfigMap: Record<string, { label: string; className: string }> = {
  CALL: { label: 'Call', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EMAIL: { label: 'Email', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  MEETING: { label: 'Meeting', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  TASK: { label: 'Task', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  MESSAGE: { label: 'Message', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  DEMO: { label: 'Demo', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  FOLLOW_UP: { label: 'Follow-up', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  OTHER: { label: 'Other', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

/** Helper function to render Activity status badge */
export const renderActivityStatusBadge = (status?: string) => {
  if (!status) return null;
  const config = ActivityStatusConfigMap[status];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{status}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Activity priority badge */
export const renderActivityPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  const config = ActivityPriorityConfigMap[priority] || PriorityConfigMap[priority];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{priority}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render Priority badge */
export const renderPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  const config = PriorityConfigMap[priority] || ActivityPriorityConfigMap[priority];
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

export const ForecastCategoryConfigMap: Record<string, StatusBadgeConfig> = {
  CLOSED: {
    label: 'Closed Won',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  COMMIT: {
    label: 'Commit',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  BEST_CASE: {
    label: 'Best Case',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  PIPELINE: {
    label: 'Pipeline',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  OMITTED: {
    label: 'Omitted',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
};

/** Helper function to render Forecast Category badge */
export const renderForecastCategoryBadge = (category?: string) => {
  if (!category) return null;
  const config = ForecastCategoryConfigMap[category];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{category}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const QuoteStatusConfigMap: Record<string, StatusBadgeConfig> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  SENT: {
    label: 'Sent',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 6,
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 7,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 8,
  },
  SUPERSEDED: {
    label: 'Superseded',
    className: 'bg-slate-100 text-slate-500 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 9,
  },
};

/** Helper function to render Quote status badge */
export const renderQuoteStatusBadge = (status?: string, effectiveStatus?: string) => {
  const displayStatus = effectiveStatus || status;
  if (!displayStatus) return null;
  const config = QuoteStatusConfigMap[displayStatus];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{displayStatus}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const OrderStatusConfigMap: Record<string, StatusBadgeConfig> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 1,
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 2,
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 3,
  },
  PARTIALLY_FULFILLED: {
    label: 'Partially Fulfilled',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 4,
  },
  FULFILLED: {
    label: 'Fulfilled',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 5,
  },
  CLOSED_PARTIAL: {
    label: 'Closed Partial',
    className: 'bg-slate-100 text-slate-600 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 6,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-500 border-slate-200 font-medium rounded-[3px] text-[10px] uppercase tracking-wider px-1.5 py-0.5',
    priorityLevel: 7,
  },
};

/** Helper function to render Order status badge */
export const renderOrderStatusBadge = (status?: string) => {
  if (!status) return null;
  const config = OrderStatusConfigMap[status];
  if (!config) return <Badge variant="outline" className="rounded-[3px] text-[10px] uppercase font-bold">{status}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};



