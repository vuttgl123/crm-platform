import React from 'react';
import {
  Shield,
  Edit,
  Eye,
  Copy,
  Trash2,
  Lock,
  Loader2,
  MoreHorizontal,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/common/EmptyState';

interface RolesTableProps {
  roles: RoleSummaryResponse[];
  loading: boolean;
  canManage: boolean;
  onView: (role: RoleSummaryResponse) => void;
  onEdit: (role: RoleSummaryResponse) => void;
  onClone: (role: RoleSummaryResponse) => void;
  onDelete: (role: RoleSummaryResponse) => void;
  onToggleStatus?: (role: RoleSummaryResponse) => void;
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
  onToggleStatus,
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
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans shadow-2xs">
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Role Code
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[220px]">
                Role Name &amp; Duty
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-center">
                Permissions
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Type
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Last Updated
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4 w-[80px]">
                Actions
              </TableHead>
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
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[2px] text-[11px] border border-blue-200">
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
                        className="bg-[#DEEBFF] text-[#0747A6] border-0 font-bold text-[10px] rounded-[2px]"
                      >
                        CUSTOM
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold rounded-[2px] shadow-none px-1.5 py-0.5 ${
                        r.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                          : 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
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

                  {/* Actions - Single 3-dot dropdown */}
                  <TableCell className="py-2.5 px-3 text-right pr-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            aria-label={`Actions for role ${r.name}`}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                          <DropdownMenuItem
                            onClick={() => onView(r)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Role Details</span>
                          </DropdownMenuItem>

                          {canManage && (
                            <DropdownMenuItem
                              onClick={() => onClone(r)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Clone Configuration</span>
                            </DropdownMenuItem>
                          )}

                          {!isSystem && canManage && (
                            <DropdownMenuItem
                              onClick={() => onEdit(r)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit Role</span>
                            </DropdownMenuItem>
                          )}

                          {!isSystem && canManage && onToggleStatus && (
                            <DropdownMenuItem
                              onClick={() => onToggleStatus(r)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5 text-amber-600" />
                              <span>{r.status === 'ACTIVE' ? 'Deactivate Role' : 'Activate Role'}</span>
                            </DropdownMenuItem>
                          )}

                          {!isSystem && canManage && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(r)}
                                className="gap-2 text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Role</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
