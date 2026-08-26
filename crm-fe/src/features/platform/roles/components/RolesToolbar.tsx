import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RolesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  typeFilter: 'ALL' | 'SYSTEM' | 'CUSTOM';
  onTypeChange: (type: 'ALL' | 'SYSTEM' | 'CUSTOM') => void;
  onResetFilters: () => void;
}

export const RolesToolbar: React.FC<RolesToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onResetFilters,
}) => {
  const isFiltered = Boolean(
    searchQuery.trim() || statusFilter !== 'ALL' || typeFilter !== 'ALL'
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs">
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles by code or name..."
            className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-[2px]"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusChange(val as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by role status"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={typeFilter}
            onValueChange={(val) => onTypeChange(val as 'ALL' | 'SYSTEM' | 'CUSTOM')}
          >
            <SelectTrigger
              className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
              aria-label="Filter by role type"
            >
              <SelectValue placeholder="Role Type" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SYSTEM">System Built-in</SelectItem>
              <SelectItem value="CUSTOM">Custom Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
};
