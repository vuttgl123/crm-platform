import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuoteFilters, QuoteOperationalView, QuoteStatus, QuoteValidityFilter } from '../model/quoteTypes';

interface QuoteFilterBarProps {
  filters: QuoteFilters;
  onFilterChange: (updates: Partial<QuoteFilters>) => void;
  onReset: () => void;
  currentView: QuoteOperationalView;
  onViewChange: (view: QuoteOperationalView) => void;
}

const VIEW_TABS: { id: QuoteOperationalView; label: string }[] = [
  { id: 'ALL', label: 'All Quotes' },
  { id: 'NEEDS_APPROVAL', label: 'Needs Approval' },
  { id: 'DRAFTS', label: 'Drafts' },
  { id: 'SENT', label: 'Sent' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'EXPIRING', label: 'Expiring' },
];

const ALL_STATUSES: { id: QuoteStatus; label: string }[] = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'SENT', label: 'Sent' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'EXPIRED', label: 'Expired' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'SUPERSEDED', label: 'Superseded' },
];

export const QuoteFilterBar: React.FC<QuoteFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  currentView,
  onViewChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.q);

  useEffect(() => {
    setSearchTerm(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.q) {
        onFilterChange({ q: searchTerm });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.q, onFilterChange]);

  const handleStatusToggle = (status: QuoteStatus) => {
    const current = filters.statuses;
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ statuses: next });
  };

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.statuses.length > 0 ||
    Boolean(filters.accountId) ||
    Boolean(filters.opportunityId) ||
    Boolean(filters.currencyCode) ||
    filters.validity !== 'ALL' ||
    Boolean(filters.issueFrom) ||
    Boolean(filters.issueTo) ||
    Boolean(filters.validFrom) ||
    Boolean(filters.validTo) ||
    !filters.latestOnly;

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-3 space-y-3">
      {/* Operational View Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-2 overflow-x-auto">
        {VIEW_TABS.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by quote #, name, customer..."
            className="pl-8.5 h-8.5 text-xs rounded-[3px] border-slate-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 rounded-[3px] border-slate-200 text-xs font-medium gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-[2px] px-1.5 py-0 text-[10px] font-bold bg-slate-100 text-slate-700 ml-1"
                >
                  {filters.statuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 rounded-[4px] border-slate-200 text-xs" align="start">
            <div className="font-semibold text-slate-800 pb-2 mb-2 border-b border-slate-100">
              Filter by Status
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ALL_STATUSES.map((st) => (
                <label
                  key={st.id}
                  className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                >
                  <Checkbox
                    checked={filters.statuses.includes(st.id)}
                    onCheckedChange={() => handleStatusToggle(st.id)}
                    className="rounded-[2px]"
                  />
                  <span>{st.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Validity Selector */}
        <Select
          value={filters.validity}
          onValueChange={(val) => onFilterChange({ validity: val as QuoteValidityFilter })}
        >
          <SelectTrigger className="w-[140px] h-8.5 rounded-[3px] border-slate-200 text-xs">
            <SelectValue placeholder="Validity" />
          </SelectTrigger>
          <SelectContent className="rounded-[3px] text-xs">
            <SelectItem value="ALL">All Validity</SelectItem>
            <SelectItem value="ACTIVE">Active Deals</SelectItem>
            <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        {/* More Filters Popover (Dates & Options) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 rounded-[3px] border-slate-200 text-xs font-medium gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>More Filters</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 rounded-[4px] border-slate-200 space-y-3" align="end">
            <div className="font-semibold text-slate-800 text-xs border-b border-slate-100 pb-2">
              Advanced Filters
            </div>

            {/* Issue Date Range */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-600">Issue Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.issueFrom || ''}
                  onChange={(e) => onFilterChange({ issueFrom: e.target.value || null })}
                  className="h-8 text-xs rounded-[3px]"
                />
                <Input
                  type="date"
                  value={filters.issueTo || ''}
                  onChange={(e) => onFilterChange({ issueTo: e.target.value || null })}
                  className="h-8 text-xs rounded-[3px]"
                />
              </div>
            </div>

            {/* Valid Until Range */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-600">Valid Until Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.validFrom || ''}
                  onChange={(e) => onFilterChange({ validFrom: e.target.value || null })}
                  className="h-8 text-xs rounded-[3px]"
                />
                <Input
                  type="date"
                  value={filters.validTo || ''}
                  onChange={(e) => onFilterChange({ validTo: e.target.value || null })}
                  className="h-8 text-xs rounded-[3px]"
                />
              </div>
            </div>

            {/* Latest Revision Only toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs text-slate-700 cursor-pointer">
                Latest Revisions Only
              </label>
              <Checkbox
                checked={filters.latestOnly}
                onCheckedChange={(checked) => onFilterChange({ latestOnly: Boolean(checked) })}
                className="rounded-[2px]"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8.5 rounded-[3px] text-xs text-slate-500 hover:text-slate-900 gap-1 px-2.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
};
