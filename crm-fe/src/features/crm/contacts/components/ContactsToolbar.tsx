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
import { ContactLifecycleStage } from '@/services/api/contactApi';
import { ContactFilterState, ContactOwnershipFilter } from '../model/contactTypes';

interface ContactsToolbarProps {
  filters: ContactFilterState;
  hasSessionTeam: boolean;
  onFilterChange: (filters: Partial<ContactFilterState>) => void;
  onResetFilters: () => void;
}

export const ContactsToolbar: React.FC<ContactsToolbarProps> = ({
  filters,
  hasSessionTeam,
  onFilterChange,
  onResetFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.q);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.q) {
        onFilterChange({ q: localSearch, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onFilterChange]);

  // Sync external search change
  useEffect(() => {
    setLocalSearch(filters.q);
  }, [filters.q]);

  const hasActiveFilters = Boolean(
    filters.q.trim() ||
      (filters.stage && filters.stage !== 'ALL') ||
      (filters.ownership && filters.ownership !== 'ALL') ||
      filters.accountId
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs">
      {/* Left side: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, number, role, or dept…"
            className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full bg-white"
            aria-label="Search contacts"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onFilterChange({ q: '', page: 1 });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-[2px]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lifecycle Stage Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={filters.stage || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                stage: val as ContactLifecycleStage | 'ALL',
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
        <div className="w-full sm:w-40">
          <Select
            value={filters.ownership || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                ownership: val as ContactOwnershipFilter,
                page: 1,
              })
            }
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by ownership"
            >
              <SelectValue placeholder="All Contacts" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Contacts</SelectItem>
              <SelectItem value="MINE">My Contacts</SelectItem>
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
            className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
};
