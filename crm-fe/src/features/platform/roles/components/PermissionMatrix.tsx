import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, Filter } from 'lucide-react';
import { ExtendedPermission } from '../model/roleTypes';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PermissionMatrixProps {
  selectedCodes: string[];
  catalog: ExtendedPermission[];
  isReadOnly: boolean;
  onToggleCode: (code: string) => void;
  onSelectMultiple: (codesToAdd: string[], codesToRemove: string[]) => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedCodes,
  catalog,
  isReadOnly,
  onToggleCode,
  onSelectMultiple,
}) => {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedOnly, setSelectedOnly] = useState(false);

  // Privileged bulk confirmation modal
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    moduleName: string;
    privilegedCodes: string[];
    allModuleCodes: string[];
  } | null>(null);

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  // Group catalog by module
  const moduleGroups = useMemo(() => {
    const map = new Map<string, { moduleNameEn: string; permissions: ExtendedPermission[] }>();

    catalog.forEach((p) => {
      const mod = p.moduleCode || 'other';
      if (!map.has(mod)) {
        map.set(mod, {
          moduleNameEn: p.moduleNameEn || mod.toUpperCase(),
          permissions: [],
        });
      }
      map.get(mod)!.permissions.push(p);
    });

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  // Filtered module groups
  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim();

    return moduleGroups
      .map(([modCode, group]) => {
        if (selectedModule !== 'ALL' && modCode !== selectedModule) {
          return null;
        }

        const filteredPerms = group.permissions.filter((p) => {
          const matchesSearch =
            !q ||
            p.permissionCode.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q);

          const matchesRisk = selectedRisk === 'ALL' || p.riskLevel === selectedRisk;
          const matchesSelected = !selectedOnly || selectedSet.has(p.permissionCode);

          return matchesSearch && matchesRisk && matchesSelected;
        });

        if (filteredPerms.length === 0) return null;

        return {
          modCode,
          moduleNameEn: group.moduleNameEn,
          permissions: filteredPerms,
          allModulePermissions: group.permissions,
        };
      })
      .filter(Boolean) as Array<{
      modCode: string;
      moduleNameEn: string;
      permissions: ExtendedPermission[];
      allModulePermissions: ExtendedPermission[];
    }>;
  }, [moduleGroups, search, selectedModule, selectedRisk, selectedOnly, selectedSet]);

  const handleModuleSelectToggle = (
    modulePermissions: ExtendedPermission[],
    moduleName: string
  ) => {
    if (isReadOnly) return;

    const moduleCodes = modulePermissions.map((p) => p.permissionCode);
    const allSelected = moduleCodes.every((c) => selectedSet.has(c));

    if (allSelected) {
      // Unselect all in module
      onSelectMultiple([], moduleCodes);
    } else {
      // Check if selecting introduces privileged permissions
      const unselectedPrivileged = modulePermissions
        .filter((p) => p.riskLevel === 'PRIVILEGED' && !selectedSet.has(p.permissionCode))
        .map((p) => p.permissionCode);

      if (unselectedPrivileged.length > 0) {
        setPendingBulkAction({
          moduleName,
          privilegedCodes: unselectedPrivileged,
          allModuleCodes: moduleCodes,
        });
      } else {
        onSelectMultiple(moduleCodes, []);
      }
    }
  };

  const confirmBulkPrivileged = () => {
    if (pendingBulkAction) {
      onSelectMultiple(pendingBulkAction.allModuleCodes, []);
      setPendingBulkAction(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50 p-2.5 border border-slate-200 rounded-[4px]">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="pl-8 h-7.5 text-xs bg-white border-slate-200 rounded-[3px] w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Module Quick Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-7.5 text-xs bg-white border border-slate-200 rounded-[3px] px-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Modules ({moduleGroups.length})</option>
            {moduleGroups.map(([code, g]) => (
              <option key={code} value={code}>
                {g.moduleNameEn}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="h-7.5 text-xs bg-white border border-slate-200 rounded-[3px] px-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="NORMAL">NORMAL</option>
            <option value="SENSITIVE">SENSITIVE</option>
            <option value="PRIVILEGED">PRIVILEGED</option>
          </select>

          {/* Selected Only toggle */}
          <Button
            type="button"
            variant={selectedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOnly(!selectedOnly)}
            className={`h-7.5 px-2 text-xs rounded-[3px] gap-1 font-semibold ${
              selectedOnly ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Selected ({selectedCodes.length})</span>
          </Button>
        </div>
      </div>

      {/* Permissions Groups Matrix */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-[4px]">
            <p className="text-xs font-semibold">No permissions match your filter criteria.</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const moduleCodes = group.allModulePermissions.map((p) => p.permissionCode);
            const selectedInModuleCount = moduleCodes.filter((c) => selectedSet.has(c)).length;
            const isAllModuleSelected =
              moduleCodes.length > 0 && selectedInModuleCount === moduleCodes.length;

            return (
              <div
                key={group.modCode}
                className="bg-white border border-slate-200 rounded-[4px] overflow-hidden"
              >
                {/* Module Header with Select All */}
                <div className="bg-[#F7F8F9] px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {group.moduleNameEn}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      ({selectedInModuleCount}/{group.allModulePermissions.length})
                    </span>
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        handleModuleSelectToggle(group.allModulePermissions, group.moduleNameEn)
                      }
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {isAllModuleSelected ? 'Deselect Module' : 'Select All in Module'}
                    </button>
                  )}
                </div>

                {/* Permissions Grid */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {group.permissions.map((p) => {
                    const isChecked = selectedSet.has(p.permissionCode);

                    return (
                      <label
                        key={p.permissionCode}
                        className={`flex items-start gap-2.5 p-2 rounded-[3px] border transition-colors select-none ${
                          isReadOnly ? 'cursor-default' : 'cursor-pointer'
                        } ${
                          isChecked
                            ? 'bg-blue-50/40 border-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isReadOnly}
                          onCheckedChange={() => onToggleCode(p.permissionCode)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-mono font-bold text-slate-900 block truncate">
                              {p.permissionCode}
                            </span>
                            {p.riskLevel === 'PRIVILEGED' ? (
                              <Badge
                                variant="outline"
                                className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] font-bold px-1 py-0 rounded-[2px] shrink-0"
                              >
                                PRIVILEGED
                              </Badge>
                            ) : p.riskLevel === 'SENSITIVE' ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold px-1 py-0 rounded-[2px] shrink-0"
                              >
                                SENSITIVE
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {p.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Privileged Bulk Grants */}
      {pendingBulkAction && (
        <Dialog open={true} onOpenChange={() => setPendingBulkAction(null)}>
          <DialogContent className="max-w-md rounded-[4px]">
            <DialogHeader>
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <DialogTitle className="text-sm font-bold text-slate-900">
                Grant Privileged Permissions in {pendingBulkAction.moduleName}?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 pt-1">
                Selecting all capabilities in this module will assign{' '}
                <span className="font-bold text-rose-600">
                  {pendingBulkAction.privilegedCodes.length} administrative-level privileged permission(s)
                </span>
                :
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-50 p-2.5 rounded-[3px] border border-slate-200 max-h-32 overflow-y-auto space-y-1">
              {pendingBulkAction.privilegedCodes.map((code) => (
                <div key={code} className="text-[11px] font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{code}</span>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingBulkAction(null)}
                className="h-8 text-xs font-semibold rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmBulkPrivileged}
                className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
              >
                Confirm &amp; Grant All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
