import React from 'react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { useForecastUrlState } from './hooks/useForecastUrlState';
import {
  useForecastSummaryQuery,
  useForecastBreakdownQuery,
  useForecastOpportunityDrilldownQuery,
  useInvalidateForecast,
} from './hooks/forecastQueries';
import { ForecastContextBar } from './components/ForecastContextBar';
import { ForecastLedger } from './components/ForecastLedger';
import { ForecastCompositionPanel } from './components/ForecastCompositionPanel';
import { ForecastDataQualityPanel } from './components/ForecastDataQualityPanel';
import { ForecastBreakdownPanel } from './components/ForecastBreakdownPanel';
import { ForecastOpportunityDrilldown } from './components/ForecastOpportunityDrilldown';
import {
  ForecastPageSkeleton,
  ForecastErrorState,
  ForecastEmptyState,
} from './components/ForecastPageStates';
import { ForecastBreakdownRow, ForecastCategory } from './model/forecastTypes';

export const SalesForecastPage: React.FC = () => {
  const {
    state,
    setPeriod,
    setPipelineId,
    setOwner,
    setCurrencyCode,
    setDimension,
    setCategory,
    setQuality,
    setPage,
    setDrilldownPage,
    clearFilters,
  } = useForecastUrlState();

  const invalidateForecast = useInvalidateForecast();

  // 1. Fetch Summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useForecastSummaryQuery({
    period: state.period,
    pipelineId: state.pipelineId || undefined,
    ownerType: state.ownerType || undefined,
    ownerId: state.ownerId || undefined,
    currencyCode: state.currencyCode || undefined,
  });

  // Resolve active currency group
  const activeCurrency = React.useMemo(() => {
    if (state.currencyCode) return state.currencyCode;
    if (summaryData?.currencyGroups && summaryData.currencyGroups.length > 0) {
      return summaryData.currencyGroups[0].currencyCode;
    }
    return 'USD';
  }, [state.currencyCode, summaryData]);

  const activeCurrencyGroup = React.useMemo(() => {
    if (!summaryData?.currencyGroups) return undefined;
    return (
      summaryData.currencyGroups.find((g) => g.currencyCode === activeCurrency) ||
      summaryData.currencyGroups[0]
    );
  }, [summaryData, activeCurrency]);

  // 2. Fetch Breakdown
  const {
    data: breakdownData,
    isLoading: isBreakdownLoading,
    refetch: refetchBreakdown,
  } = useForecastBreakdownQuery({
    period: state.period,
    dimension: state.dimension,
    currencyCode: activeCurrency,
    pipelineId: state.pipelineId || undefined,
    ownerType: state.ownerType || undefined,
    ownerId: state.ownerId || undefined,
    page: state.page,
    size: state.size,
  });

  // 3. Fetch Opportunity Drilldown
  const drilldownParams = React.useMemo(() => {
    const params: any = {
      page: state.drilldownPage,
      size: state.drilldownSize,
      currencyCode: activeCurrency,
    };
    if (state.pipelineId) params.pipelineId = state.pipelineId;
    if (state.ownerType && state.ownerId) {
      params.ownerType = state.ownerType;
      params.ownerId = state.ownerId;
    }
    if (state.category && state.category !== 'ALL') {
      params.forecastCategory = state.category;
    }
    if (state.quality) {
      params.forecastQuality = state.quality;
    }
    if (summaryData?.period) {
      params.forecastFrom = summaryData.period.fromDate;
      params.forecastTo = summaryData.period.toDate;
    }
    return params;
  }, [state, activeCurrency, summaryData]);

  const {
    data: drilldownData,
    isLoading: isDrilldownLoading,
    refetch: refetchDrilldown,
  } = useForecastOpportunityDrilldownQuery(drilldownParams, Boolean(summaryData));

  const handleRefresh = () => {
    invalidateForecast();
    refetchSummary();
    refetchBreakdown();
    refetchDrilldown();
  };

  const handleSelectSubject = (row: ForecastBreakdownRow) => {
    if (state.dimension === 'OWNER') {
      if (row.subject.kind === 'USER' && row.subject.id) {
        setOwner('USER', row.subject.id);
      } else if (row.subject.kind === 'TEAM' && row.subject.id) {
        setOwner('TEAM', row.subject.id);
      }
    } else {
      // Stage dimension - set category to that stage's forecast category
      if (row.subject.forecastCategory) {
        setCategory(row.subject.forecastCategory);
      }
    }
  };

  if (isSummaryLoading && !summaryData) {
    return (
      <div className="space-y-4 pb-12 font-sans w-full">
        <StandardPageHeader
          title="Sales Forecast"
          subtitle="Live revenue projection and pipeline predictability rollup derived from real deal stages."
          badgeLabel="period deals"
          badgeCount={0}
        />
        <ForecastPageSkeleton />
      </div>
    );
  }

  if (isSummaryError && !summaryData) {
    return (
      <div className="space-y-4 pb-12 font-sans w-full">
        <StandardPageHeader
          title="Sales Forecast"
          subtitle="Live revenue projection and pipeline predictability rollup derived from real deal stages."
          badgeLabel="period deals"
          badgeCount={0}
        />
        <ForecastErrorState error={summaryError} onRetry={handleRefresh} />
      </div>
    );
  }

  const isFiltered =
    state.period !== 'THIS_MONTH' ||
    Boolean(state.pipelineId) ||
    Boolean(state.ownerId) ||
    Boolean(state.currencyCode) ||
    Boolean(state.category) ||
    Boolean(state.quality);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Role Governance Header */}
      <StandardPageHeader
        title="Sales Forecast"
        subtitle="Live revenue projection and pipeline predictability rollup derived from real deal stages."
        badgeLabel="period deals"
        badgeCount={activeCurrencyGroup?.eligibleOpportunityCount || 0}
      />

      {/* Forecast Context Bar */}
      <ForecastContextBar
        state={state}
        summaryData={summaryData}
        isLoading={isSummaryLoading || isBreakdownLoading}
        onPeriodChange={setPeriod}
        onPipelineChange={setPipelineId}
        onOwnerChange={setOwner}
        onCurrencyChange={setCurrencyCode}
        onRefresh={handleRefresh}
        onClearFilters={clearFilters}
      />

      {!activeCurrencyGroup && (
        <ForecastEmptyState onResetFilters={clearFilters} isFiltered={isFiltered} />
      )}

      {activeCurrencyGroup && (
        <>
          {/* Primary Rollup Ledger */}
          <ForecastLedger
            summary={activeCurrencyGroup}
            selectedCategory={state.category}
            onSelectCategory={setCategory}
            currencyCode={activeCurrency}
          />

          {/* Composition & Data Quality Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ForecastCompositionPanel
              summary={activeCurrencyGroup}
              currencyCode={activeCurrency}
              onSelectCategory={(cat: ForecastCategory) => setCategory(cat)}
            />
            <ForecastDataQualityPanel
              summary={activeCurrencyGroup}
              currencyCode={activeCurrency}
              onSelectQuality={setQuality}
              onSelectCategory={(cat: ForecastCategory) => setCategory(cat)}
            />
          </div>

          {/* Breakdown Table */}
          <ForecastBreakdownPanel
            breakdownData={breakdownData}
            dimension={state.dimension}
            currencyCode={activeCurrency}
            isLoading={isBreakdownLoading}
            onDimensionChange={setDimension}
            onPageChange={setPage}
            onSelectSubject={handleSelectSubject}
          />

          {/* Deep-Linked Opportunity Drilldown */}
          <ForecastOpportunityDrilldown
            drilldownResult={drilldownData}
            isLoading={isDrilldownLoading}
            selectedCategory={state.category}
            selectedQuality={state.quality}
            currencyCode={activeCurrency}
            onClearDrilldown={() => {
              setCategory(null);
              setQuality(null);
            }}
            onPageChange={setDrilldownPage}
          />
        </>
      )}
    </div>
  );
};

export default SalesForecastPage;
