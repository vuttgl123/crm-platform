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
import { Search, X, RotateCcw } from 'lucide-react';
import {
  LeadRating,
  LeadFilterState,
  LeadOwnershipFilter,
  LeadConversionFilter,
  LeadStatusItem,
  LeadSourceItem,
} from '../model/leadTypes';

interface LeadsToolbarProps {
  filters: LeadFilterState;
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  hasSessionTeam: boolean;
  onFilterChange: (filters: Partial<LeadFilterState>) => void;
  onResetFilters: () => void;
}

export const LeadsToolbar: React.FC<LeadsToolbarProps> = ({
  filters,
  statuses,
  sources,
  hasSessionTeam,
  onFilterChange,
  onResetFilters,
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
      filters.statusId ||
      filters.sourceId ||
      (filters.rating && filters.rating !== 'ALL') ||
      (filters.ownership && filters.ownership !== 'ALL') ||
      (filters.conversion && filters.conversion !== 'ALL')
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
            placeholder="Search lead name, number, company…"
            className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full bg-white"
            aria-label="Search leads"
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

        {/* Status Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.statusId || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ statusId: val === 'ALL' ? '' : val, page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Statuses</SelectItem>
              {statuses
                .filter((s) => s.active || s.id === filters.statusId)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.sourceId || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ sourceId: val === 'ALL' ? '' : val, page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by source"
            >
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Sources</SelectItem>
              {sources
                .filter((src) => src.active || src.id === filters.sourceId)
                .map((src) => (
                  <SelectItem key={src.id} value={src.id}>
                    {src.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="w-full sm:w-32">
          <Select
            value={filters.rating || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ rating: val as LeadRating | 'ALL', page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by rating"
            >
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Ratings</SelectItem>
              <SelectItem value="HOT">Hot</SelectItem>
              <SelectItem value="WARM">Warm</SelectItem>
              <SelectItem value="COLD">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ownership Filter */}
        <div className="w-full sm:w-32">
          <Select
            value={filters.ownership || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ ownership: val as LeadOwnershipFilter, page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by ownership"
            >
              <SelectValue placeholder="All Leads" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Ownership</SelectItem>
              <SelectItem value="MINE">My Leads</SelectItem>
              {hasSessionTeam && <SelectItem value="TEAM">My Team</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Conversion Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.conversion || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ conversion: val as LeadConversionFilter, page: 1 })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by conversion state"
            >
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value="ACTIVE">Active (Unconverted)</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side: Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0 self-start lg:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};
