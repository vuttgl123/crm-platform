import React, { useMemo } from 'react';
import {
  ArrowLeftRight,
  Check,
  X,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import {
  ExtendedPermission,
  ComparisonFilterState,
} from '../model/roleTypes';
import { useRoleDetail } from '../hooks/roleQueries';
import { computeRoleComparison } from '../model/roleDiff';
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

interface RoleComparisonProps {
  roles: RoleSummaryResponse[];
  catalog: ExtendedPermission[];
  filters: ComparisonFilterState;
  onFilterChange: (updates: Partial<ComparisonFilterState>) => void;
  tenantId?: string;
}

export const RoleComparison: React.FC<RoleComparisonProps> = ({
  roles,
  catalog,
  filters,
  onFilterChange,
  tenantId,
}) => {
  const { leftRoleId, rightRoleId, search, module, onlyDifferences } = filters;

  // Fetch both role details
  const { data: leftRole, isLoading: loadingLeft } = useRoleDetail(
    leftRoleId,
    tenantId,
    Boolean(leftRoleId)
  );

  const { data: rightRole, isLoading: loadingRight } = useRoleDetail(
    rightRoleId,
    tenantId,
    Boolean(rightRoleId)
  );

  const isLoading = loadingLeft || loadingRight;

  // Compute comparison
  const comparisonResult = useMemo(() => {
    if (!leftRole || !rightRole) return null;
    return computeRoleComparison(leftRole, rightRole, catalog);
  }, [leftRole, rightRole, catalog]);

  // Compute available modules
  const availableModules = useMemo(() => {
    if (!comparisonResult) return [];
    const set = new Set<string>();
    comparisonResult.permissions.forEach((p) => {
      if (p.moduleCode) set.add(p.moduleCode);
    });
    return Array.from(set).sort();
  }, [comparisonResult]);

  // Filtered permission rows
  const filteredPermissions = useMemo(() => {
    if (!comparisonResult) return [];
    const q = search.toLowerCase().trim();

    return comparisonResult.permissions.filter((p) => {
      const matchesSearch =
        !q ||
        p.permissionCode.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesModule =
        module === 'ALL' || p.moduleCode.toLowerCase() === module.toLowerCase();

      const matchesDiff = !onlyDifferences || p.isDiff;

      return matchesSearch && matchesModule && matchesDiff;
    });
  }, [comparisonResult, search, module, onlyDifferences]);

  return (
    <div className="space-y-4">
      {/* Role Selection Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-[4px] space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Role Picker */}
          <div className="w-full md:w-5/12 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
              Baseline Role (Left)
            </span>
            <Select
              value={leftRoleId}
              onValueChange={(val) => onFilterChange({ leftRoleId: val })}
            >
              <SelectTrigger className="h-8.5 text-xs border-slate-200 rounded-[3px] bg-white">
                <SelectValue placeholder="Select primary role..." />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                {roles.map((r) => (
                  <SelectItem
                    key={r.id}
                    value={r.id}
                    disabled={r.id === rightRoleId}
                  >
                    {r.name} ({r.roleCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <ArrowLeftRight className="w-4 h-4" />
          </div>

          {/* Right Role Picker */}
          <div className="w-full md:w-5/12 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
              Comparison Role (Right)
            </span>
            <Select
              value={rightRoleId}
              onValueChange={(val) => onFilterChange({ rightRoleId: val })}
            >
              <SelectTrigger className="h-8.5 text-xs border-slate-200 rounded-[3px] bg-white">
                <SelectValue placeholder="Select comparison target..." />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                {roles.map((r) => (
                  <SelectItem
                    key={r.id}
                    value={r.id}
                    disabled={r.id === leftRoleId}
                  >
                    {r.name} ({r.roleCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* State views */}
      {!leftRoleId || !rightRoleId ? (
        <div className="bg-white border border-slate-200 rounded-[4px] p-8 text-center">
          <ArrowLeftRight className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-800">Select Two Roles To Compare</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Pick any two distinct built-in or custom roles from the dropdowns above to perform side-by-side RBAC differential analysis.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading comparative role structures…</span>
        </div>
      ) : comparisonResult ? (
        <div className="space-y-4">
          {/* Comparison Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-[4px] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Common Permissions</span>
              <span className="text-lg font-black text-emerald-600 font-mono tabular-nums block mt-0.5">
                {comparisonResult.totalCommonPermissions}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Left Only Unique</span>
              <span className="text-lg font-black text-blue-600 font-mono tabular-nums block mt-0.5">
                {comparisonResult.totalLeftOnlyPermissions}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Right Only Unique</span>
              <span className="text-lg font-black text-purple-600 font-mono tabular-nums block mt-0.5">
                {comparisonResult.totalRightOnlyPermissions}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scope Alignment</span>
              <span className="text-lg font-black text-indigo-600 font-mono tabular-nums block mt-0.5">
                {comparisonResult.totalCommonScopes}/{comparisonResult.scopes.length}
              </span>
            </div>
          </div>

          {/* Filter Bar for Comparison */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-3 border border-slate-200 rounded-[4px]">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => onFilterChange({ search: e.target.value })}
                  placeholder="Filter permissions..."
                  className="pl-8 h-7.5 text-xs border-slate-200 rounded-[3px] w-full"
                />
              </div>

              <select
                value={module}
                onChange={(e) => onFilterChange({ module: e.target.value })}
                className="h-7.5 text-xs bg-white border border-slate-200 rounded-[3px] px-2 text-slate-700 font-medium w-full sm:w-44"
              >
                <option value="ALL">All Modules ({availableModules.length})</option>
                {availableModules.map((m) => (
                  <option key={m} value={m}>
                    {m.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant={onlyDifferences ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ onlyDifferences: !onlyDifferences })}
              className={`h-7.5 px-2.5 text-xs rounded-[3px] font-semibold gap-1 ${
                onlyDifferences ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Only Differences</span>
            </Button>
          </div>

          {/* Permissions Matrix Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                  <TableRow className="hover:bg-[#F7F8F9]">
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Permission Code</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Capability Description</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center w-36">
                      <span className="text-blue-700 font-bold block truncate max-w-[130px] mx-auto">
                        {comparisonResult.leftRole.name}
                      </span>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center w-36">
                      <span className="text-purple-700 font-bold block truncate max-w-[130px] mx-auto">
                        {comparisonResult.rightRole.name}
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        No permissions match your filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((row) => (
                      <TableRow
                        key={row.permissionCode}
                        className={`border-b border-[#EBECF0] text-xs transition-colors ${
                          row.isDiff ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-[#F1F2F4]'
                        }`}
                      >
                        <TableCell className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-200/80 text-[11px]">
                            {row.permissionCode}
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5 px-3 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{row.description}</span>
                            {row.riskLevel === 'PRIVILEGED' && (
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] font-bold px-1 py-0 rounded-[2px]">
                                PRIVILEGED
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Left Role Status */}
                        <TableCell className="py-2.5 px-3 text-center">
                          {row.inLeft ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 mx-auto">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </TableCell>

                        {/* Right Role Status */}
                        <TableCell className="py-2.5 px-3 text-center">
                          {row.inRight ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 mx-auto">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
