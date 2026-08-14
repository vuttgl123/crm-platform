import React, { useState, useMemo } from 'react';
import { ExtendedPermission } from '../RolesPage';
import { Search, Key, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface PermissionGroupSelectorProps {
  permissions: ExtendedPermission[];
  selectedPermissions: string[];
  onChange: (newPermissions: string[]) => void;
  readOnly?: boolean;
}

export const PermissionGroupSelector: React.FC<PermissionGroupSelectorProps> = ({
  permissions,
  selectedPermissions,
  onChange,
  readOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const safeSelectedPermissions = useMemo(() => {
    return Array.isArray(selectedPermissions) ? selectedPermissions : [];
  }, [selectedPermissions]);

  const safePermissions = useMemo(() => {
    return Array.isArray(permissions) ? permissions : [];
  }, [permissions]);

  // Filter permissions by search query and module
  const filteredPermissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return safePermissions.filter((perm) => {
      if (!perm) return false;
      const permCode = (perm.permissionCode || perm.code || '').toLowerCase();
      const desc = (perm.description || perm.displayNameVi || perm.descriptionVi || '').toLowerCase();
      const modName = (perm.moduleNameVi || perm.moduleCode || '').toLowerCase();

      const matchSearch = desc.includes(q) || permCode.includes(q) || modName.includes(q);
      const matchModule = selectedModule === 'ALL' || perm.moduleCode === selectedModule;
      return matchSearch && matchModule;
    });
  }, [safePermissions, searchQuery, selectedModule]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, { moduleCode: string; moduleNameVi: string; items: ExtendedPermission[] }>();

    filteredPermissions.forEach((perm) => {
      if (!perm) return;
      const code = perm.moduleCode || 'other';
      const name = perm.moduleNameVi || 'Phân hệ khác';
      if (!map.has(code)) {
        map.set(code, { moduleCode: code, moduleNameVi: name, items: [] });
      }
      map.get(code)!.items.push(perm);
    });

    return Array.from(map.values());
  }, [filteredPermissions]);

  // All unique modules for filter tabs
  const allModules = useMemo(() => {
    const map = new Map<string, string>();
    safePermissions.forEach((p) => {
      if (p && p.moduleCode) {
        map.set(p.moduleCode, p.moduleNameVi || p.moduleCode);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [safePermissions]);

  const togglePermission = (code: string) => {
    if (readOnly) return;
    if (safeSelectedPermissions.includes(code)) {
      onChange(safeSelectedPermissions.filter((p) => p !== code));
    } else {
      onChange([...safeSelectedPermissions, code]);
    }
  };

  const handleSelectAllModule = (moduleItems: ExtendedPermission[]) => {
    if (readOnly) return;
    const moduleCodes = moduleItems.map((m) => m.permissionCode).filter(Boolean);
    const allSelected = moduleCodes.every((c) => safeSelectedPermissions.includes(c));

    if (allSelected) {
      // Uncheck all in this module
      onChange(safeSelectedPermissions.filter((c) => !moduleCodes.includes(c)));
    } else {
      // Check all in this module
      const combined = new Set([...safeSelectedPermissions, ...moduleCodes]);
      onChange(Array.from(combined));
    }
  };

  const handleSelectAllGlobal = () => {
    if (readOnly) return;
    const allCodes = safePermissions.map((p) => p.permissionCode).filter(Boolean);
    onChange(allCodes);
  };

  const handleDeselectAllGlobal = () => {
    if (readOnly) return;
    onChange([]);
  };

  const renderRiskBadge = (riskLevel?: string) => {
    if (riskLevel === 'PRIVILEGED') {
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold px-1.5 py-0.5">
          Quyền Cao cấp
        </Badge>
      );
    }
    if (riskLevel === 'SENSITIVE') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold px-1.5 py-0.5">
          Nhạy cảm
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-normal px-1.5 py-0.5">
        Thông thường
      </Badge>
    );
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Search & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Tìm kiếm quyền theo mã, tên hoặc phân hệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 bg-white border-slate-200"
          />
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllGlobal}
              className="h-8 text-xs font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              Chọn tất cả ({permissions.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAllGlobal}
              className="h-8 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Bỏ chọn
            </Button>
          </div>
        )}
      </div>

      {/* Module Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <Badge
          onClick={() => setSelectedModule('ALL')}
          className={`cursor-pointer text-[11px] px-2.5 py-1 font-semibold rounded-lg transition-colors ${
            selectedModule === 'ALL'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
          }`}
        >
          Tất cả Phân hệ ({safePermissions.length})
        </Badge>
        {allModules.map((mod) => {
          const countInMod = safePermissions.filter((p) => p && p.moduleCode === mod.code).length;
          const selectedInMod = safePermissions.filter((p) => p && p.moduleCode === mod.code && safeSelectedPermissions.includes(p.permissionCode)).length;

          return (
            <Badge
              key={mod.code}
              onClick={() => setSelectedModule(mod.code)}
              variant="outline"
              className={`cursor-pointer text-[11px] px-2.5 py-1 font-medium rounded-lg transition-colors gap-1 shrink-0 ${
                selectedModule === mod.code
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 font-bold'
                  : selectedInMod > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{mod.name}</span>
              <span className="opacity-80 text-[10px]">({selectedInMod}/{countInMod})</span>
            </Badge>
          );
        })}
      </div>

      {/* Grouped Permissions List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {groupedPermissions.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            Không tìm thấy quyền phù hợp với từ khóa tìm kiếm.
          </div>
        ) : (
          groupedPermissions.map((group) => {
            const moduleCodes = group.items.map((i) => i.permissionCode).filter(Boolean);
            const selectedCount = moduleCodes.filter((c) => safeSelectedPermissions.includes(c)).length;
            const isAllSelected = selectedCount === group.items.length && group.items.length > 0;

            return (
              <div
                key={group.moduleCode}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
              >
                {/* Module Group Header */}
                <div className="bg-slate-50/90 border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-xs">{group.moduleNameVi}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold px-2 py-0.5 ${
                        selectedCount > 0
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {selectedCount} / {group.items.length} đã chọn
                    </Badge>
                  </div>

                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAllModule(group.items)}
                      className="h-7 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isAllSelected ? 'Bỏ chọn nhóm' : 'Chọn cả nhóm'}</span>
                    </Button>
                  )}
                </div>

                {/* Module Permissions Grid */}
                <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white">
                  {group.items.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.permissionCode);
                    return (
                      <div
                        key={perm.permissionCode}
                        onClick={() => togglePermission(perm.permissionCode)}
                        className={`p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Checkbox
                            checked={isChecked}
                            disabled={readOnly}
                            onCheckedChange={() => togglePermission(perm.permissionCode)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs leading-tight truncate">
                              {perm.description}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                              {perm.permissionCode}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {renderRiskBadge(perm.riskLevel)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
