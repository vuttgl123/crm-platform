import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  OpportunityParsedSearchParams,
  parseOpportunitySearchParams,
  serializeOpportunitySearchParams,
} from '../model/opportunitySearchParams';

export function useOpportunityUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsedParams = useMemo(() => {
    return parseOpportunitySearchParams(searchParams);
  }, [searchParams]);

  const updateParams = useCallback(
    (newValues: Partial<OpportunityParsedSearchParams>) => {
      const merged: OpportunityParsedSearchParams = {
        ...parsedParams,
        ...newValues,
      };

      // Reset page to 0 if filter criteria changed (excluding explicit page changes)
      if (
        newValues.page === undefined &&
        (newValues.q !== undefined ||
          newValues.accountId !== undefined ||
          newValues.pipelineId !== undefined ||
          newValues.stageId !== undefined ||
          newValues.status !== undefined ||
          newValues.opportunityType !== undefined ||
          newValues.ownerId !== undefined ||
          newValues.ownerType !== undefined)
      ) {
        merged.page = 0;
      }

      const nextSearchParams = serializeOpportunitySearchParams(merged);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [parsedParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    const nextSearchParams = serializeOpportunitySearchParams({
      view: parsedParams.view,
      pipelineId: parsedParams.pipelineId,
      page: 0,
      size: 20,
    });
    setSearchParams(nextSearchParams, { replace: true });
  }, [parsedParams.view, parsedParams.pipelineId, setSearchParams]);

  return {
    params: parsedParams,
    updateParams,
    resetFilters,
  };
}
