import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ViewTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ElementType;
  dotColor?: string;
}

interface StandardFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  viewTabs?: ViewTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  filterControls?: React.ReactNode;
  activeFiltersCount?: number;
  onResetFilters?: () => void;
}

export const StandardFilterBar: React.FC<StandardFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search keywords...',
  viewTabs,
  activeTab,
  onTabChange,
  filterControls,
  activeFiltersCount = 0,
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 py-1">
      {/* Left: Quick Search & Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search Input Box */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 text-xs h-8 bg-white border-slate-200 rounded-[3px] focus:ring-1 focus:ring-[#0C66E4] focus:border-[#0C66E4] placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        {viewTabs && viewTabs.length > 0 && onTabChange && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {viewTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#E9F2FF] text-[#0C66E4] font-semibold border border-[#0C66E4]/30'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 font-medium'
                  }`}
                >
                  {tab.dotColor && (
                    <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor} shrink-0`} />
                  )}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1 rounded-full font-mono ${
                      isActive ? 'bg-[#0C66E4]/10 text-[#0C66E4] font-bold' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Dropdown Filter Controls & Reset Button */}
      {(filterControls || (activeFiltersCount > 0 && onResetFilters)) && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {filterControls}

          {activeFiltersCount > 0 && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 gap-1 rounded-[3px]"
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
