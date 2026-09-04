import { apiFetch } from './apiClient';

export type ForecastPeriodPreset = 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

export interface OverviewPeriod {
  preset: ForecastPeriodPreset;
  fromDate: string;
  toDate: string;
  previousFromDate: string;
  previousToDate: string;
  timezone: string;
}

export interface RevenueBlock {
  currencyCode: string;
  closedWonAmount: string;
  previousClosedWonAmount: string;
  closedWonChangePercent: number | null;
  closedWonCount: number;
  openPipelineAmount: string;
  weightedForecastAmount: string;
  openOpportunityCount: number;
}

export interface FunnelStage {
  stageId: string;
  stageName: string;
  pipelineName: string;
  displayOrder: number;
  stageCategory: string;
  openPipelineAmount: string;
  opportunityCount: number;
}

export interface FunnelBlock {
  currencyCode: string;
  stages: FunnelStage[];
}

export interface OpportunityHighlight {
  id: string;
  name: string;
  accountName: string;
  stageName: string;
  ownerName: string;
  amount: string;
  currencyCode: string;
  probability: number | null;
  expectedCloseDate: string;
}

export interface TopOpportunitiesBlock {
  currencyCode: string;
  items: OpportunityHighlight[];
}

export interface LeaderboardEntry {
  ownerKind: 'USER' | 'TEAM' | 'UNASSIGNED' | string;
  ownerId: string | null;
  ownerLabel: string;
  closedWonAmount: string;
  openPipelineAmount: string;
  weightedForecastAmount: string;
  opportunityCount: number;
}

export interface LeaderboardBlock {
  currencyCode: string;
  entries: LeaderboardEntry[];
}

export interface LifecycleCount {
  lifecycleStage: string;
  accountCount: number;
}

export interface CustomerBaseBlock {
  totalCount: number;
  stages: LifecycleCount[];
  churnedSharePercent: number | null;
}

export interface DueActivity {
  id: string;
  subject: string;
  activityType: string;
  priority: string;
  status: string;
  scheduledStartAt: string | null;
  accountName: string | null;
  overdue: boolean;
}

export interface MyDayBlock {
  overdueCount: number;
  dueTodayCount: number;
  items: DueActivity[];
}

export interface OverviewResponse {
  period: OverviewPeriod;
  asOf: string;
  revenue: RevenueBlock | null;
  funnel: FunnelBlock | null;
  topOpportunities: TopOpportunitiesBlock | null;
  leaderboard: LeaderboardBlock | null;
  customerBase: CustomerBaseBlock | null;
  myDay: MyDayBlock | null;
}

export const overviewApi = {
  getOverview: async (period: ForecastPeriodPreset = 'THIS_QUARTER'): Promise<OverviewResponse> => {
    return apiFetch<OverviewResponse>(`/overview?period=${period}`);
  },
};

export default overviewApi;
