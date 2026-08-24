import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ForecastActiveTab,
  ForecastBreakdownDimension,
  ForecastCategory,
  ForecastOwnerType,
  ForecastPeriodPreset,
  ForecastQualityCode,
  ForecastUrlState,
} from '../model/forecastTypes';
import {
  parseForecastSearchParams,
  serializeForecastSearchParams,
} from '../model/forecastSearchParams';

export function useForecastUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state: ForecastUrlState = useMemo(() => {
    return parseForecastSearchParams(searchParams);
  }, [searchParams]);

  const updateState = useCallback(
    (updates: Partial<ForecastUrlState>) => {
      const nextState = { ...state, ...updates };
      const serialized = serializeForecastSearchParams(nextState);
      setSearchParams(serialized, { replace: true });
    },
    [state, setSearchParams]
  );

  const setPeriod = useCallback(
    (period: ForecastPeriodPreset) => {
      updateState({ period, page: 0, drilldownPage: 0 });
    },
    [updateState]
  );

  const setPipelineId = useCallback(
    (pipelineId: string | null) => {
      updateState({ pipelineId, page: 0, drilldownPage: 0 });
    },
    [updateState]
  );

  const setOwner = useCallback(
    (ownerType: ForecastOwnerType | null, ownerId: string | null) => {
      updateState({ ownerType, ownerId, page: 0, drilldownPage: 0 });
    },
    [updateState]
  );

  const setCurrencyCode = useCallback(
    (currencyCode: string | null) => {
      updateState({ currencyCode, page: 0, drilldownPage: 0 });
    },
    [updateState]
  );

  const setDimension = useCallback(
    (dimension: ForecastBreakdownDimension) => {
      updateState({ dimension, page: 0 });
    },
    [updateState]
  );

  const setCategory = useCallback(
    (category: ForecastCategory | 'ALL' | null) => {
      updateState({ category, quality: null, drilldownPage: 0, activeTab: 'DRILLDOWN' });
    },
    [updateState]
  );

  const setQuality = useCallback(
    (quality: ForecastQualityCode | null) => {
      updateState({ quality, category: null, drilldownPage: 0, activeTab: 'QUALITY' });
    },
    [updateState]
  );

  const setPage = useCallback(
    (page: number) => {
      updateState({ page });
    },
    [updateState]
  );

  const setDrilldownPage = useCallback(
    (drilldownPage: number) => {
      updateState({ drilldownPage });
    },
    [updateState]
  );

  const setActiveTab = useCallback(
    (activeTab: ForecastActiveTab) => {
      updateState({ activeTab });
    },
    [updateState]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    state,
    updateState,
    setPeriod,
    setPipelineId,
    setOwner,
    setCurrencyCode,
    setDimension,
    setCategory,
    setQuality,
    setPage,
    setDrilldownPage,
    setActiveTab,
    clearFilters,
  };
}
