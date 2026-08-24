import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  X,
  RotateCcw,
  Network,
  List,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  AccountType,
  AccountLifecycleStage,
  AccountFilterState,
  AccountOwnershipFilter,
} from '../model/accountTypes';
import { ActionTooltip } from '@/components/ui/action-tooltip';

interface AccountsToolbarProps {
  filters: AccountFilterState;
  hasSessionTeam: boolean;
  onFilterChange: (filters: Partial<AccountFilterState>) => void;
  onResetFilters: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  filters,
  hasSessionTeam,
  onFilterChange,
  onResetFilters,
  onExpandAll,
  onCollapseAll,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.q);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.q) {
        onFilterChange({ q: localSearch, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onFilterChange]);

  useEffect(() => {
    setLocalSearch(filters.q);
  }, [filters.q]);

  const hasActiveFilters = Boolean(
    filters.q.trim() ||
      (filters.accountType && filters.accountType !== 'ALL') ||
      (filters.lifecycleStage && filters.lifecycleStage !== 'ALL') ||
      (filters.ownership && filters.ownership !== 'ALL')
  );

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px]">
      {/* Left side: Search & Filter Selects */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search account name, number…"
            className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full bg-white"
            aria-label="Search accounts"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onFilterChange({ q: '', page: 1 });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Account Type Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.accountType || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ accountType: val as AccountType | 'ALL', page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by account type"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="ORGANIZATION">Organization</SelectItem>
              <SelectItem value="PERSON">Person</SelectItem>
              <SelectItem value="PARTNER">Partner</SelectItem>
              <SelectItem value="RESELLER">Reseller</SelectItem>
              <SelectItem value="SUPPLIER">Supplier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lifecycle Stage Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.lifecycleStage || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                lifecycleStage: val as AccountLifecycleStage | 'ALL',
                page: 1,
              })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by lifecycle stage"
            >
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value="PROSPECT">Prospect</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="CHURNED">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ownership Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.ownership || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                ownership: val as AccountOwnershipFilter,
                page: 1,
              })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by ownership"
            >
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Ownership</SelectItem>
              <SelectItem value="MINE">My Accounts</SelectItem>
              {hasSessionTeam && <SelectItem value="TEAM">My Team</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Right side: View Mode Toggle & Tree Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
        {filters.viewMode === 'tree' && (
          <div className="flex items-center gap-1">
            <ActionTooltip label="Expand all subsidiary branches">
              <Button
                variant="outline"
                size="sm"
                onClick={onExpandAll}
                className="h-7 px-2 text-[11px] font-semibold text-slate-600 border-slate-200 rounded-[3px] gap-1"
              >
                <ChevronDown className="w-3 h-3 text-slate-500" />
                <span>Expand All</span>
              </Button>
            </ActionTooltip>

            <ActionTooltip label="Collapse all subsidiary branches">
              <Button
                variant="outline"
                size="sm"
                onClick={onCollapseAll}
                className="h-7 px-2 text-[11px] font-semibold text-slate-600 border-slate-200 rounded-[3px] gap-1"
              >
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span>Collapse All</span>
              </Button>
            </ActionTooltip>
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-[3px]">
          <ActionTooltip label="Hierarchical Tree View (Parent & Subsidiaries)">
            <button
              onClick={() => onFilterChange({ viewMode: 'tree' })}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                filters.viewMode === 'tree'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Tree view"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Tree</span>
            </button>
          </ActionTooltip>

          <ActionTooltip label="Flat List View">
            <button
              onClick={() => onFilterChange({ viewMode: 'flat' })}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                filters.viewMode === 'flat'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Flat list view"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </ActionTooltip>
        </div>
      </div>
    </div>
  );
};
