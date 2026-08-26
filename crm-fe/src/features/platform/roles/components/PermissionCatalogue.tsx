import React, { useMemo } from 'react';
import { Search, X, RotateCcw, Key, Loader2 } from 'lucide-react';
import { ExtendedPermission, CatalogueFilterState } from '../model/roleTypes';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { StandardPagination } from '@/components/common/StandardPagination';
import { EmptyState } from '@/components/common/EmptyState';

interface PermissionCatalogueProps {
  permissions: ExtendedPermission[];
  loading: boolean;
  filters: CatalogueFilterState;
  onFilterChange: (updates: Partial<CatalogueFilterState>) => void;
}

export const PermissionCatalogue: React.FC<PermissionCatalogueProps> = ({
  permissions,
  loading,
  filters,
  onFilterChange,
}) => {
  // Compute available modules
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    permissions.forEach((p) => {
      if (p.moduleCode) set.add(p.moduleCode);
    });
    return Array.from(set).sort();
  }, [permissions]);

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const q = filters.search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.permissionCode.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesModule =
        filters.module === 'ALL' || p.moduleCode.toLowerCase() === filters.module.toLowerCase();

      const matchesRisk =
        filters.risk === 'ALL' || p.riskLevel === filters.risk;

      return matchesSearch && matchesModule && matchesRisk;
    });
  }, [permissions, filters]);

  // Paginate
  const totalElements = filteredPermissions.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / filters.pageSize));
  const currentPage = Math.min(filters.page, totalPages);

  const paginatedPermissions = useMemo(() => {
    const start = (currentPage - 1) * filters.pageSize;
    return filteredPermissions.slice(start, start + filters.pageSize);
  }, [filteredPermissions, currentPage, filters.pageSize]);

  const isFiltered = Boolean(
    filters.search.trim() || filters.module !== 'ALL' || filters.risk !== 'ALL'
  );

  return (
    <div className="space-y-3 font-sans">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ search: e.target.value, page: 1 })
              }
              placeholder="Search permission code or action description..."
              className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '', page: 1 })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-[2px]"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filters.module}
              onValueChange={(val) => onFilterChange({ module: val, page: 1 })}
            >
              <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
                <SelectValue placeholder="Module Scope" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px] text-xs">
                <SelectItem value="ALL">All Modules ({availableModules.length})</SelectItem>
                {availableModules.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={filters.risk}
              onValueChange={(val) => onFilterChange({ risk: val, page: 1 })}
            >
              <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px] text-xs">
                <SelectItem value="ALL">All Risk Levels</SelectItem>
                <SelectItem value="NORMAL">NORMAL</SelectItem>
                <SelectItem value="SENSITIVE">SENSITIVE</SelectItem>
                <SelectItem value="PRIVILEGED">PRIVILEGED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFilterChange({ search: '', module: 'ALL', risk: 'ALL', page: 1 })
              }
              className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading system permission catalogue…</span>
          </div>
        ) : paginatedPermissions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Key}
              title="No permissions match your filter"
              description="Try adjusting your keyword search or resetting module & risk filters."
              actionLabel="Clear Filter"
              onAction={() =>
                onFilterChange({ search: '', module: 'ALL', risk: 'ALL', page: 1 })
              }
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                  <TableRow className="hover:bg-[#F7F8F9]">
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Permission Code</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Module</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Operational Capability Description</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Risk Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPermissions.map((p) => (
                    <TableRow
                      key={p.permissionCode}
                      className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                    >
                      <TableCell className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-200/80 text-[11px]">
                          {p.permissionCode}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5 px-3 font-semibold text-slate-700">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold">
                          {p.moduleCode.toUpperCase()}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5 px-3 text-slate-700">
                        {p.description}
                      </TableCell>

                      <TableCell className="text-right pr-4 py-2.5 px-3">
                        {p.riskLevel === 'PRIVILEGED' ? (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[10px] rounded-[2px]"
                          >
                            PRIVILEGED
                          </Badge>
                        ) : p.riskLevel === 'SENSITIVE' ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px] rounded-[2px]"
                          >
                            SENSITIVE
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-600 border-slate-200 font-semibold text-[10px] rounded-[2px]"
                          >
                            NORMAL
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Standard Pagination */}
            <StandardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={filters.pageSize}
              onPageChange={(p) => onFilterChange({ page: p })}
              onPageSizeChange={(s) => onFilterChange({ pageSize: s, page: 1 })}
              itemLabel="permissions"
            />
          </div>
        )}
      </div>
    </div>
  );
};
