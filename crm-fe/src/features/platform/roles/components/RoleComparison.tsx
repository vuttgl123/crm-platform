import React, { useMemo, useCallback } from 'react';
import {
  ArrowLeftRight,
  Check,
  X,
  Search,
  Filter,
  Loader2,
  RotateCcw,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Layers,
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
import { ActionTooltip } from '@/components/ui/action-tooltip';

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

  const handleSwapRoles = useCallback(() => {
    if (leftRoleId && rightRoleId) {
      onFilterChange({
        leftRoleId: rightRoleId,
        rightRoleId: leftRoleId,
      });
    }
  }, [leftRoleId, rightRoleId, onFilterChange]);

  const isTableFiltered = Boolean(search.trim() || module !== 'ALL' || onlyDifferences);

  return (
    <div className="space-y-4 font-sans">
      {/* Role Selection Picker Card */}
      <div className="bg-white p-4 border border-slate-200 rounded-[4px] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Role Picker */}
          <div className="w-full md:w-5/12 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Baseline Role (Left)
            </span>
            <Select
              value={leftRoleId}
              onValueChange={(val) => onFilterChange({ leftRoleId: val })}
            >
              <SelectTrigger
                className="h-8 text-xs border-slate-200 rounded-[3px] bg-white w-full"
                aria-label="Select baseline role"
              >
                <SelectValue placeholder="Select primary role..." />
              </SelectTrigger>
              <SelectContent className="rounded-[3px] text-xs max-h-72">
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

          {/* Swap Roles Button */}
          <div className="pt-0 md:pt-4 shrink-0">
            <ActionTooltip label="Swap baseline and comparison roles">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!leftRoleId || !rightRoleId}
                onClick={handleSwapRoles}
                className="h-8 w-8 rounded-[3px] border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Swap comparison roles"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </Button>
            </ActionTooltip>
          </div>

          {/* Right Role Picker */}
          <div className="w-full md:w-5/12 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Comparison Role (Right)
            </span>
            <Select
              value={rightRoleId}
              onValueChange={(val) => onFilterChange({ rightRoleId: val })}
            >
              <SelectTrigger
                className="h-8 text-xs border-slate-200 rounded-[3px] bg-white w-full"
                aria-label="Select comparison role"
              >
                <SelectValue placeholder="Select comparison target..." />
              </SelectTrigger>
              <SelectContent className="rounded-[3px] text-xs max-h-72">
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

      {/* State Views */}
      {!leftRoleId || !rightRoleId ? (
        <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-900">Select Two Roles To Compare</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pick any two distinct built-in or custom security roles from the dropdowns above to perform side-by-side capability &amp; data scope differential analysis.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px] shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading comparative role structures…</span>
        </div>
      ) : comparisonResult ? (
        <div className="space-y-4">
          {/* Comparison Metrics Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-[3px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Common Permissions
                </span>
                <span className="text-base font-black text-emerald-600 font-mono tabular-nums leading-tight block mt-0.5">
                  {comparisonResult.totalCommonPermissions}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-[3px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {comparisonResult.leftRole.roleCode} Only
                </span>
                <span className="text-base font-black text-blue-600 font-mono tabular-nums leading-tight block mt-0.5">
                  {comparisonResult.totalLeftOnlyPermissions}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-[3px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {comparisonResult.rightRole.roleCode} Only
                </span>
                <span className="text-base font-black text-purple-600 font-mono tabular-nums leading-tight block mt-0.5">
                  {comparisonResult.totalRightOnlyPermissions}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-[3px] bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Scope Alignment
                </span>
                <span className="text-base font-black text-indigo-600 font-mono tabular-nums leading-tight block mt-0.5">
                  {comparisonResult.totalCommonScopes}/{comparisonResult.scopes.length}
                </span>
              </div>
            </div>
          </div>

          {/* Standard Filter Toolbar for Comparison */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => onFilterChange({ search: e.target.value })}
                  placeholder="Filter permissions by code or action..."
                  className="pl-8 pr-7 h-8 text-xs border-slate-200 rounded-[3px] w-full"
                />
                {search && (
                  <button
                    onClick={() => onFilterChange({ search: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-[2px]"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Module Scope Select */}
              <div className="w-full sm:w-48">
                <Select
                  value={module}
                  onValueChange={(val) => onFilterChange({ module: val })}
                >
                  <SelectTrigger
                    className="h-8 text-xs border-slate-200 rounded-[3px] bg-white"
                    aria-label="Filter comparison by module"
                  >
                    <SelectValue placeholder="Module Scope" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[3px] text-xs max-h-60">
                    <SelectItem value="ALL">All Modules ({availableModules.length})</SelectItem>
                    {availableModules.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Only Differences Toggle Button */}
              <Button
                type="button"
                variant={onlyDifferences ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ onlyDifferences: !onlyDifferences })}
                className={`h-8 px-2.5 text-xs rounded-[3px] font-semibold gap-1.5 shrink-0 ${
                  onlyDifferences
                    ? 'bg-[#0C66E4] hover:bg-[#0052CC] text-white shadow-none'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Only Differences</span>
              </Button>

              {/* Reset Comparison Filter */}
              {isTableFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onFilterChange({
                      search: '',
                      module: 'ALL',
                      onlyDifferences: false,
                    })
                  }
                  className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Permissions Matrix Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                  <TableRow className="hover:bg-[#F7F8F9]">
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[200px]">
                      Permission Code
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                      Capability Description
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center min-w-[160px]">
                      <div className="flex flex-col items-center">
                        <span className="text-blue-700 font-bold text-xs line-clamp-1">
                          {comparisonResult.leftRole.name}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 font-semibold mt-0.5">
                          ({comparisonResult.leftRole.roleCode})
                        </span>
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center min-w-[160px]">
                      <div className="flex flex-col items-center">
                        <span className="text-purple-700 font-bold text-xs line-clamp-1">
                          {comparisonResult.rightRole.name}
                        </span>
                        <span className="font-mono text-[10px] text-purple-600 font-semibold mt-0.5">
                          ({comparisonResult.rightRole.roleCode})
                        </span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        No permissions match your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((row) => (
                      <TableRow
                        key={row.permissionCode}
                        className={`border-b border-[#EBECF0] text-xs transition-colors ${
                          row.isDiff
                            ? 'bg-amber-50/40 hover:bg-amber-50/70'
                            : 'hover:bg-[#F1F2F4]'
                        }`}
                      >
                        <TableCell className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-200/80 text-[11px]">
                            {row.permissionCode}
                          </span>
                        </TableCell>

                        <TableCell className="py-2.5 px-3 text-slate-700">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{row.description}</span>
                            {row.riskLevel === 'PRIVILEGED' && (
                              <Badge
                                variant="outline"
                                className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] font-bold px-1 py-0 rounded-[2px]"
                              >
                                PRIVILEGED
                              </Badge>
                            )}
                            {row.riskLevel === 'SENSITIVE' && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold px-1 py-0 rounded-[2px]"
                              >
                                SENSITIVE
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
