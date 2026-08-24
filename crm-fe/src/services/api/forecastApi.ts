import { apiFetch } from './apiClient';

export type ForecastPeriodPreset = 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

export type ForecastCategory =
  | 'CLOSED'
  | 'COMMIT'
  | 'BEST_CASE'
  | 'PIPELINE'
  | 'OMITTED';

export type ForecastBreakdownDimension = 'OWNER' | 'STAGE';

export type ForecastQualityCode =
  | 'UNSCHEDULED'
  | 'STATUS_STAGE_CONFLICT'
  | 'MISSING_OWNER';

export type ForecastOwnerType = 'USER' | 'TEAM';

export interface ForecastPeriodContext {
  preset: ForecastPeriodPreset;
  fromDate: string;
  toDate: string;
  timezone: string;
}

export interface AppliedForecastFilters {
  pipelineId: string | null;
  owner: {
    type: ForecastOwnerType;
    id: string;
    label: string;
  } | null;
  currencyCode: string | null;
}

export interface ForecastCategoryMetric {
  category: ForecastCategory;
  amount: string;
  opportunityCount: number;
}

export interface ForecastQualityMetric {
  code: ForecastQualityCode;
  amount: string;
  opportunityCount: number;
  scope: 'SELECTED_PERIOD' | 'FILTERS_EXCLUDING_PERIOD';
}

export interface ForecastCurrencySummary {
  currencyCode: string;
  weightedForecastAmount: string;
  openPipelineAmount: string;
  eligibleOpportunityCount: number;
  categories: ForecastCategoryMetric[];
  quality: ForecastQualityMetric[];
}

export interface SalesForecastSummaryResponse {
  period: ForecastPeriodContext;
  appliedFilters: AppliedForecastFilters;
  tenantCurrencyCode: string;
  asOf: string;
  currencyGroups: ForecastCurrencySummary[];
}

export interface ForecastBreakdownSubject {
  kind: 'USER' | 'TEAM' | 'UNASSIGNED' | 'STAGE';
  id: string | null;
  label: string;
  pipelineId: string | null;
  pipelineName: string | null;
  displayOrder: number | null;
  stageCategory: 'OPEN' | 'WON' | 'LOST' | null;
  forecastCategory: ForecastCategory | null;
}

export interface ForecastBreakdownRow {
  subject: ForecastBreakdownSubject;
  currencyCode: string;
  weightedForecastAmount: string;
  openPipelineAmount: string;
  opportunityCount: number;
  categories: ForecastCategoryMetric[];
}

export interface ForecastBreakdownResponse {
  dimension: ForecastBreakdownDimension;
  period: ForecastPeriodContext;
  appliedFilters: AppliedForecastFilters;
  currencyCode: string;
  items: ForecastBreakdownRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  asOf: string;
}

export interface ForecastSummaryParams {
  period?: ForecastPeriodPreset;
  pipelineId?: string;
  ownerType?: ForecastOwnerType;
  ownerId?: string;
  currencyCode?: string;
}

export interface ForecastBreakdownParams extends ForecastSummaryParams {
  dimension: ForecastBreakdownDimension;
  currencyCode: string;
  page?: number;
  size?: number;
}

export const forecastApi = {
  async getForecastSummary(
    params: ForecastSummaryParams = {},
    signal?: AbortSignal
  ): Promise<SalesForecastSummaryResponse> {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.set('period', params.period);
    if (params.pipelineId) searchParams.set('pipelineId', params.pipelineId);
    if (params.ownerType && params.ownerId) {
      searchParams.set('ownerType', params.ownerType);
      searchParams.set('ownerId', params.ownerId);
    }
    if (params.currencyCode) searchParams.set('currencyCode', params.currencyCode);

    const qs = searchParams.toString();
    const endpoint = `/sales/forecast${qs ? `?${qs}` : ''}`;
    return apiFetch<SalesForecastSummaryResponse>(endpoint, { signal });
  },

  async getForecastBreakdown(
    params: ForecastBreakdownParams,
    signal?: AbortSignal
  ): Promise<ForecastBreakdownResponse> {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.set('period', params.period);
    if (params.dimension) searchParams.set('dimension', params.dimension);
    if (params.currencyCode) searchParams.set('currencyCode', params.currencyCode);
    if (params.pipelineId) searchParams.set('pipelineId', params.pipelineId);
    if (params.ownerType && params.ownerId) {
      searchParams.set('ownerType', params.ownerType);
      searchParams.set('ownerId', params.ownerId);
    }
    if (params.page !== undefined && params.page >= 0) {
      searchParams.set('page', params.page.toString());
    }
    if (params.size !== undefined && params.size > 0) {
      searchParams.set('size', params.size.toString());
    }

    const qs = searchParams.toString();
    const endpoint = `/sales/forecast/breakdown${qs ? `?${qs}` : ''}`;
    return apiFetch<ForecastBreakdownResponse>(endpoint, { signal });
  },
};
