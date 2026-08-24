import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ActivityUrlState,
  parseActivityUrlParams,
  serializeActivityUrlParams,
} from '../model/activitySearchParams';
import { ActivityViewMode, ActivityQueuePreset } from '../model/activityTypes';

export function useActivityUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = React.useMemo(
    () => parseActivityUrlParams(searchParams),
    [searchParams]
  );

  const updateParams = React.useCallback(
    (updates: Partial<ActivityUrlState>) => {
      const nextState: ActivityUrlState = {
        ...params,
        ...updates,
      };

      // Reset page to 0 when query/filters/queue change unless page was explicitly updated
      if (
        updates.page === undefined &&
        (updates.q !== undefined ||
          updates.queue !== undefined ||
          updates.activityType !== undefined ||
          updates.status !== undefined ||
          updates.priority !== undefined ||
          updates.ownerUserId !== undefined ||
          updates.assignedTeamId !== undefined ||
          updates.relatedType !== undefined ||
          updates.relatedId !== undefined ||
          updates.from !== undefined ||
          updates.to !== undefined)
      ) {
        nextState.page = 0;
      }

      // If view changes, adjust default sort
      if (updates.view && updates.view !== params.view && updates.sort === undefined) {
        nextState.sort = updates.view === 'agenda' ? 'scheduledStartAt:asc' : 'updatedAt:desc';
      }

      const nextSearchParams = serializeActivityUrlParams(nextState);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [params, setSearchParams]
  );

  const setView = React.useCallback(
    (view: ActivityViewMode) => {
      updateParams({ view });
    },
    [updateParams]
  );

  const setQueue = React.useCallback(
    (queue: ActivityQueuePreset) => {
      updateParams({ queue, status: '', page: 0 });
    },
    [updateParams]
  );

  const resetFilters = React.useCallback(() => {
    updateParams({
      q: '',
      activityType: '',
      status: '',
      priority: '',
      ownerUserId: '',
      assignedTeamId: '',
      relatedType: '',
      relatedId: '',
      from: '',
      to: '',
      page: 0,
    });
  }, [updateParams]);

  return {
    params,
    updateParams,
    setView,
    setQueue,
    resetFilters,
  };
}
