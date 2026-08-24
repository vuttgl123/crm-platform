import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ForecastBreakdownParams,
  ForecastBreakdownResponse,
  ForecastSummaryParams,
  SalesForecastSummaryResponse,
  forecastApi,
} from '@/services/api/forecastApi';
import {
  OpportunitySearchParams,
  OpportunitySummaryResponse,
  opportunityApi,
} from '@/services/api/opportunityApi';
import type { PageResult } from '@/services/api/accountApi';

export const forecastKeys = {
  all: ['sales-forecast'] as const,
  summary: (params: ForecastSummaryParams) => [...forecastKeys.all, 'summary', params] as const,
  breakdown: (params: ForecastBreakdownParams) => [...forecastKeys.all, 'breakdown', params] as const,
  drilldown: (params: OpportunitySearchParams) => [...forecastKeys.all, 'drilldown', params] as const,
};

export function useForecastSummaryQuery(params: ForecastSummaryParams) {
  return useQuery<SalesForecastSummaryResponse>({
    queryKey: forecastKeys.summary(params),
    queryFn: ({ signal }) => forecastApi.getForecastSummary(params, signal),
    staleTime: 30_000,
  });
}

export function useForecastBreakdownQuery(params: ForecastBreakdownParams) {
  return useQuery<ForecastBreakdownResponse>({
    queryKey: forecastKeys.breakdown(params),
    queryFn: ({ signal }) => forecastApi.getForecastBreakdown(params, signal),
    staleTime: 30_000,
  });
}

export function useForecastOpportunityDrilldownQuery(
  params: OpportunitySearchParams,
  enabled: boolean = true
) {
  return useQuery<PageResult<OpportunitySummaryResponse>>({
    queryKey: forecastKeys.drilldown(params),
    queryFn: ({ signal }) => opportunityApi.search(params, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useInvalidateForecast() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: forecastKeys.all });
  };
}
