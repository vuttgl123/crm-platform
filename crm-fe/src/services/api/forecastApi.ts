import { apiFetch } from './apiClient';

export interface SalesRepPerformance {
  repName: string;
  closedAmount: number;
  openAmount: number;
  targetQuota: number;
  quotaAttainmentPercent: number;
  wonDealsCount: number;
  lostDealsCount: number;
}

export interface SalesForecastSummary {
  period: string;
  closedWonAmount: number;
  commitAmount: number;
  bestCaseAmount: number;
  pipelineAmount: number;
  totalTargetQuota: number;
  weightedForecastAmount: number;
  winRatePercent: number;
  totalDealsCount: number;
  salesRepPerformance: SalesRepPerformance[];
}

export const forecastApi = {
  async getForecastSummary(period: 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' = 'THIS_MONTH'): Promise<SalesForecastSummary> {
    return apiFetch<SalesForecastSummary>(`/sales/forecast?period=${period}`, {
      method: 'GET',
    });
  },
};
