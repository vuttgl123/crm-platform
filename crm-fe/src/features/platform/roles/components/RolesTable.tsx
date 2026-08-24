import React from 'react';
import {
  Shield,
  Edit,
  Eye,
  Copy,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { ActionTooltip } from '@/components/ui/action-tooltip';

interface RolesTableProps {
  roles: RoleSummaryResponse[];
  loading: boolean;
  canManage: boolean;
  onView: (role: RoleSummaryResponse) => void;
  onEdit: (role: RoleSummaryResponse) => void;
  onClone: (role: RoleSummaryResponse) => void;
  onDelete: (role: RoleSummaryResponse) => void;
  onCreateClick?: () => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  loading,
  canManage,
  onView,
  onEdit,
  onClone,
  onDelete,
  onCreateClick,
}) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading security roles…</span>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-6">
        <EmptyState
          icon={Shield}
          title="No security roles found"
          description="Try adjusting your search criteria or create a new custom role to configure granular team permissions."
          actionLabel={canManage && onCreateClick ? 'Create Custom Role' : undefined}
          onAction={canManage ? onCreateClick : undefined}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden">
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Role Code</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Role Name &amp; Duty</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center">Permissions</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Type</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Status</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Last Updated</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => {
              const isSystem = r.system || r.isSystem;
              return (
                <TableRow
                  key={r.id}
                  className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                >
                  {/* Role Code */}
                  <TableCell className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-200/80 text-[11px]">
                      {r.roleCode}
                    </span>
                  </TableCell>

                  {/* Role Name & Description */}
                  <TableCell className="py-2.5 px-3 min-w-[220px]">
                    <div>
                      <span
                        onClick={() => (isSystem || !canManage ? onView(r) : onEdit(r))}
                        className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer block"
                      >
                        {r.name}
                      </span>
                      {r.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Permissions count */}
                  <TableCell className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-[2px] text-[11px] border border-blue-200/80">
                      {r.permissionCount}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-2.5 px-3">
                    {isSystem ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-700 border-slate-300 font-semibold text-[10px] gap-1 rounded-[2px]"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>SYSTEM</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px] rounded-[2px]"
                      >
                        CUSTOM
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold rounded-[2px] shadow-none ${
                        r.status === 'ACTIVE'
                          ? 'bg-[#E3FCEF] text-[#006644] border-emerald-300'
                          : 'bg-[#FFFAE6] text-[#974F0C] border-amber-200'
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>

                  {/* Last Updated */}
                  <TableCell className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {r.updatedAt
                      ? new Date(r.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4 py-2.5 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {isSystem || !canManage ? (
                        <ActionTooltip label="View details">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(r)}
                            aria-label={`View role details for ${r.name}`}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      ) : (
                        <ActionTooltip label="Edit role">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(r)}
                            aria-label={`Edit role ${r.name}`}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}

                      {canManage && (
                        <ActionTooltip label="Clone role">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClone(r)}
                            aria-label={`Clone role ${r.name}`}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-indigo-600 rounded-[3px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}

                      {!isSystem && canManage && (
                        <ActionTooltip label="Delete role">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(r)}
                            aria-label={`Delete custom role ${r.name}`}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 rounded-[3px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
