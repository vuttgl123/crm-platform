import {
  ForecastActiveTab,
  ForecastBreakdownDimension,
  ForecastCategory,
  ForecastOwnerType,
  ForecastPeriodPreset,
  ForecastQualityCode,
  ForecastUrlState,
} from './forecastTypes';

export const DEFAULT_FORECAST_URL_STATE: ForecastUrlState = {
  period: 'THIS_MONTH',
  pipelineId: null,
  ownerType: null,
  ownerId: null,
  currencyCode: null,
  dimension: 'OWNER',
  category: null,
  quality: null,
  page: 0,
  size: 20,
  drilldownPage: 0,
  drilldownSize: 20,
  activeTab: 'OVERVIEW',
};

export function parseForecastSearchParams(searchParams: URLSearchParams): ForecastUrlState {
  const periodParam = searchParams.get('period');
  const period: ForecastPeriodPreset =
    periodParam === 'THIS_QUARTER' || periodParam === 'THIS_YEAR' || periodParam === 'THIS_MONTH'
      ? periodParam
      : 'THIS_MONTH';

  const pipelineId = searchParams.get('pipelineId') || null;

  const ownerTypeParam = searchParams.get('ownerType');
  const ownerType: ForecastOwnerType | null =
    ownerTypeParam === 'USER' || ownerTypeParam === 'TEAM' ? ownerTypeParam : null;

  const ownerId = searchParams.get('ownerId') || null;
  const currencyCode = searchParams.get('currencyCode') ? searchParams.get('currencyCode')!.toUpperCase() : null;

  const dimParam = searchParams.get('dimension');
  const dimension: ForecastBreakdownDimension = dimParam === 'STAGE' ? 'STAGE' : 'OWNER';

  const catParam = searchParams.get('category');
  const validCategories: (ForecastCategory | 'ALL')[] = ['CLOSED', 'COMMIT', 'BEST_CASE', 'PIPELINE', 'OMITTED', 'ALL'];
  const category = validCategories.includes(catParam as any) ? (catParam as ForecastCategory | 'ALL') : null;

  const qualityParam = searchParams.get('quality');
  const validQuality: ForecastQualityCode[] = ['UNSCHEDULED', 'STATUS_STAGE_CONFLICT', 'MISSING_OWNER'];
  const quality = validQuality.includes(qualityParam as any) ? (qualityParam as ForecastQualityCode) : null;

  const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
  const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '20', 10) || 20));

  const drilldownPage = Math.max(0, parseInt(searchParams.get('drilldownPage') || '0', 10) || 0);
  const drilldownSize = Math.max(1, Math.min(100, parseInt(searchParams.get('drilldownSize') || '20', 10) || 20));

  const tabParam = searchParams.get('activeTab');
  const validTabs: ForecastActiveTab[] = ['OVERVIEW', 'BREAKDOWN', 'DRILLDOWN', 'QUALITY'];
  const activeTab: ForecastActiveTab = validTabs.includes(tabParam as any) ? (tabParam as ForecastActiveTab) : 'OVERVIEW';

  return {
    period,
    pipelineId,
    ownerType: ownerId ? ownerType : null,
    ownerId: ownerType ? ownerId : null,
    currencyCode,
    dimension,
    category,
    quality,
    page,
    size,
    drilldownPage,
    drilldownSize,
    activeTab,
  };
}

export function serializeForecastSearchParams(state: Partial<ForecastUrlState>): URLSearchParams {
  const params = new URLSearchParams();

  if (state.period && state.period !== 'THIS_MONTH') {
    params.set('period', state.period);
  }

  if (state.pipelineId) {
    params.set('pipelineId', state.pipelineId);
  }

  if (state.ownerType && state.ownerId) {
    params.set('ownerType', state.ownerType);
    params.set('ownerId', state.ownerId);
  }

  if (state.currencyCode) {
    params.set('currencyCode', state.currencyCode);
  }

  if (state.dimension && state.dimension !== 'OWNER') {
    params.set('dimension', state.dimension);
  }

  if (state.category) {
    params.set('category', state.category);
  }

  if (state.quality) {
    params.set('quality', state.quality);
  }

  if (state.page && state.page > 0) {
    params.set('page', state.page.toString());
  }

  if (state.size && state.size !== 20) {
    params.set('size', state.size.toString());
  }

  if (state.drilldownPage && state.drilldownPage > 0) {
    params.set('drilldownPage', state.drilldownPage.toString());
  }

  if (state.drilldownSize && state.drilldownSize !== 20) {
    params.set('drilldownSize', state.drilldownSize.toString());
  }

  if (state.activeTab && state.activeTab !== 'OVERVIEW') {
    params.set('activeTab', state.activeTab);
  }

  return params;
}
