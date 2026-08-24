import {
  ForecastBreakdownDimension,
  ForecastBreakdownResponse,
  ForecastBreakdownRow,
  ForecastBreakdownSubject,
  ForecastCategory,
  ForecastCategoryMetric,
  ForecastCurrencySummary,
  ForecastOwnerType,
  ForecastPeriodContext,
  ForecastPeriodPreset,
  ForecastQualityCode,
  ForecastQualityMetric,
  SalesForecastSummaryResponse,
} from '@/services/api/forecastApi';

export type {
  ForecastBreakdownDimension,
  ForecastBreakdownResponse,
  ForecastBreakdownRow,
  ForecastBreakdownSubject,
  ForecastCategory,
  ForecastCategoryMetric,
  ForecastCurrencySummary,
  ForecastOwnerType,
  ForecastPeriodContext,
  ForecastPeriodPreset,
  ForecastQualityCode,
  ForecastQualityMetric,
  SalesForecastSummaryResponse,
};

export type ForecastActiveTab = 'OVERVIEW' | 'BREAKDOWN' | 'DRILLDOWN' | 'QUALITY';

export interface ForecastUrlState {
  period: ForecastPeriodPreset;
  pipelineId: string | null;
  ownerType: ForecastOwnerType | null;
  ownerId: string | null;
  currencyCode: string | null;
  dimension: ForecastBreakdownDimension;
  category: ForecastCategory | 'ALL' | null;
  quality: ForecastQualityCode | null;
  page: number;
  size: number;
  drilldownPage: number;
  drilldownSize: number;
  activeTab: ForecastActiveTab;
}
