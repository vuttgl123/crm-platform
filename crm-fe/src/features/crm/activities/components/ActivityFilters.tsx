import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityUrlState } from '../model/activitySearchParams';
import {
  ActivityType,
  ActivityStatus,
  ActivityPriority,
} from '../model/activityTypes';
import {
  Search,
  RotateCcw,
  LayoutList,
  Calendar,
  X,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFiltersProps {
  params: ActivityUrlState;
  onUpdateParams: (updates: Partial<ActivityUrlState>) => void;
  onResetFilters: () => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  params,
  onUpdateParams,
  onResetFilters,
}) => {
  const [searchValue, setSearchValue] = React.useState(params.q);

  React.useEffect(() => {
    setSearchValue(params.q);
  }, [params.q]);

  // Debounced search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== params.q) {
        onUpdateParams({ q: searchValue, page: 0 });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, params.q, onUpdateParams]);

  // Determine allowed statuses based on active queue
  const allowedStatuses = React.useMemo<ActivityStatus[]>(() => {
    switch (params.queue) {
      case 'my-work':
        return ['PLANNED', 'IN_PROGRESS', 'DEFERRED'];
      case 'overdue':
      case 'today':
      case 'upcoming':
        return ['PLANNED', 'IN_PROGRESS'];
      case 'completed':
        return ['COMPLETED'];
      case 'all':
      default:
        return ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED', 'CANCELLED'];
    }
  }, [params.queue]);

  const hasActiveFilters = Boolean(
    params.q ||
      params.activityType ||
      params.status ||
      params.priority ||
      params.ownerUserId ||
      params.assignedTeamId ||
      params.relatedId ||
      params.from ||
      params.to
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-3 font-sans w-full">
      {/* Top row: Search, Dropdowns, View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search subject, description, or outcome…"
            className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 rounded-[3px] focus:bg-white"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                onUpdateParams({ q: '', page: 0 });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Activity Type */}
          <Select
            value={params.activityType || 'ALL'}
            onValueChange={(val) =>
              onUpdateParams({
                activityType: val === 'ALL' ? '' : (val as ActivityType),
                page: 0,
              })
            }
          >
            <SelectTrigger className="h-8 w-[130px] text-xs bg-slate-50 border-slate-200 rounded-[3px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="text-xs font-sans">
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="CALL">Call</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="MEETING">Meeting</SelectItem>
              <SelectItem value="TASK">Task</SelectItem>
              <SelectItem value="MESSAGE">Message</SelectItem>
              <SelectItem value="DEMO">Demo</SelectItem>
              <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Status (Disabled in Completed queue) */}
          {params.queue !== 'completed' && (
            <Select
              value={params.status || 'ALL'}
              onValueChange={(val) =>
                onUpdateParams({
                  status: val === 'ALL' ? '' : (val as ActivityStatus),
                  page: 0,
                })
              }
            >
              <SelectTrigger className="h-8 w-[130px] text-xs bg-slate-50 border-slate-200 rounded-[3px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="ALL">All statuses</SelectItem>
                {allowedStatuses.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Priority */}
          <Select
            value={params.priority || 'ALL'}
            onValueChange={(val) =>
              onUpdateParams({
                priority: val === 'ALL' ? '' : (val as ActivityPriority),
                page: 0,
              })
            }
          >
            <SelectTrigger className="h-8 w-[120px] text-xs bg-slate-50 border-slate-200 rounded-[3px]">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent className="text-xs font-sans">
              <SelectItem value="ALL">All priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-[3px] border border-slate-200 ml-1">
            <button
              type="button"
              onClick={() => onUpdateParams({ view: 'agenda' })}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-semibold transition-all',
                params.view === 'agenda'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
              title="Agenda View"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateParams({ view: 'list' })}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-semibold transition-all',
                params.view === 'list'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Active filters:
          </span>

          {params.q && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-[2px] text-[11px]">
              <span>Query: &quot;{params.q}&quot;</span>
              <button
                type="button"
                onClick={() => onUpdateParams({ q: '' })}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {params.activityType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-[2px] text-[11px]">
              <span>Type: {params.activityType}</span>
              <button
                type="button"
                onClick={() => onUpdateParams({ activityType: '' })}
                className="hover:text-slate-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {params.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-[2px] text-[11px]">
              <span>Status: {params.status}</span>
              <button
                type="button"
                onClick={() => onUpdateParams({ status: '' })}
                className="hover:text-slate-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {params.priority && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-[2px] text-[11px]">
              <span>Priority: {params.priority}</span>
              <button
                type="button"
                onClick={() => onUpdateParams({ priority: '' })}
                className="hover:text-slate-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 rounded-[2px] gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </Button>
        </div>
      )}
    </div>
  );
};
