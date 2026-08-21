import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import {
  RoleFilterState,
  CatalogueFilterState,
  ComparisonFilterState,
} from './model/roleTypes';

export function useRoleSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'roles';

  // 1. Roles Tab Params
  const roleFilters: RoleFilterState = useMemo(() => {
    return {
      search: searchParams.get('q') || '',
      status: (searchParams.get('status') as 'ALL' | 'ACTIVE' | 'INACTIVE') || 'ALL',
      type: (searchParams.get('type') as 'ALL' | 'SYSTEM' | 'CUSTOM') || 'ALL',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      pageSize: Math.max(5, parseInt(searchParams.get('size') || '10', 10)),
    };
  }, [searchParams]);

  const setRoleFilters = useCallback(
    (updates: Partial<RoleFilterState>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (updates.search !== undefined) {
          if (updates.search) next.set('q', updates.search);
          else next.delete('q');
        }
        if (updates.status !== undefined) {
          if (updates.status !== 'ALL') next.set('status', updates.status);
          else next.delete('status');
        }
        if (updates.type !== undefined) {
          if (updates.type !== 'ALL') next.set('type', updates.type);
          else next.delete('type');
        }
        if (updates.page !== undefined) {
          if (updates.page > 1) next.set('page', updates.page.toString());
          else next.delete('page');
        }
        if (updates.pageSize !== undefined) {
          if (updates.pageSize !== 10) next.set('size', updates.pageSize.toString());
          else next.delete('size');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // 2. Catalogue Tab Params
  const catalogueFilters: CatalogueFilterState = useMemo(() => {
    return {
      search: searchParams.get('cat_q') || '',
      module: searchParams.get('cat_module') || 'ALL',
      risk: searchParams.get('cat_risk') || 'ALL',
      page: Math.max(1, parseInt(searchParams.get('cat_page') || '1', 10)),
      pageSize: Math.max(5, parseInt(searchParams.get('cat_size') || '15', 10)),
    };
  }, [searchParams]);

  const setCatalogueFilters = useCallback(
    (updates: Partial<CatalogueFilterState>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (updates.search !== undefined) {
          if (updates.search) next.set('cat_q', updates.search);
          else next.delete('cat_q');
        }
        if (updates.module !== undefined) {
          if (updates.module !== 'ALL') next.set('cat_module', updates.module);
          else next.delete('cat_module');
        }
        if (updates.risk !== undefined) {
          if (updates.risk !== 'ALL') next.set('cat_risk', updates.risk);
          else next.delete('cat_risk');
        }
        if (updates.page !== undefined) {
          if (updates.page > 1) next.set('cat_page', updates.page.toString());
          else next.delete('cat_page');
        }
        if (updates.pageSize !== undefined) {
          if (updates.pageSize !== 15) next.set('cat_size', updates.pageSize.toString());
          else next.delete('cat_size');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // 3. Comparison Tab Params
  const comparisonFilters: ComparisonFilterState = useMemo(() => {
    return {
      leftRoleId: searchParams.get('cmp_left') || '',
      rightRoleId: searchParams.get('cmp_right') || '',
      search: searchParams.get('cmp_q') || '',
      module: searchParams.get('cmp_module') || 'ALL',
      onlyDifferences: searchParams.get('cmp_diff') === 'true',
      page: Math.max(1, parseInt(searchParams.get('cmp_page') || '1', 10)),
      pageSize: Math.max(5, parseInt(searchParams.get('cmp_size') || '20', 10)),
    };
  }, [searchParams]);

  const setComparisonFilters = useCallback(
    (updates: Partial<ComparisonFilterState>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (updates.leftRoleId !== undefined) {
          if (updates.leftRoleId) next.set('cmp_left', updates.leftRoleId);
          else next.delete('cmp_left');
        }
        if (updates.rightRoleId !== undefined) {
          if (updates.rightRoleId) next.set('cmp_right', updates.rightRoleId);
          else next.delete('cmp_right');
        }
        if (updates.search !== undefined) {
          if (updates.search) next.set('cmp_q', updates.search);
          else next.delete('cmp_q');
        }
        if (updates.module !== undefined) {
          if (updates.module !== 'ALL') next.set('cmp_module', updates.module);
          else next.delete('cmp_module');
        }
        if (updates.onlyDifferences !== undefined) {
          if (updates.onlyDifferences) next.set('cmp_diff', 'true');
          else next.delete('cmp_diff');
        }
        if (updates.page !== undefined) {
          if (updates.page > 1) next.set('cmp_page', updates.page.toString());
          else next.delete('cmp_page');
        }
        if (updates.pageSize !== undefined) {
          if (updates.pageSize !== 20) next.set('cmp_size', updates.pageSize.toString());
          else next.delete('cmp_size');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      });
    },
    [setSearchParams]
  );

  return {
    activeTab,
    setActiveTab,
    roleFilters,
    setRoleFilters,
    catalogueFilters,
    setCatalogueFilters,
    comparisonFilters,
    setComparisonFilters,
  };
}
