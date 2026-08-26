import React from 'react';
import { ContactSummaryResponse } from '@/services/api/contactApi';
import { renderLifecycleStageBadge } from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Ban, MoreHorizontal } from 'lucide-react';

interface ContactMobileListProps {
  contacts: ContactSummaryResponse[];
  canWrite: boolean;
  onView: (contact: ContactSummaryResponse) => void;
  onEdit: (contact: ContactSummaryResponse) => void;
  onDelete: (contact: ContactSummaryResponse) => void;
}

export const ContactMobileList: React.FC<ContactMobileListProps> = ({
  contacts,
  canWrite,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-3 font-sans">
      {contacts.map((c) => (
        <div
          key={c.id}
          className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3"
        >
          {/* Top row: Name, Number & Lifecycle Badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <button
                onClick={() => onView(c)}
                className="font-bold text-sm text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
              >
                {c.displayName}
              </button>
              <span className="font-mono text-xs text-slate-400 block mt-0.5">
                {c.contactNumber}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              {renderLifecycleStageBadge(c.lifecycleStage)}
            </div>
          </div>

          {/* Middle metadata: Job title, Account, DNC */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Job Title &amp; Department
              </span>
              <span className="text-slate-700 font-medium line-clamp-1 mt-0.5">
                {c.jobTitle || '—'} {c.department ? `(${c.department})` : ''}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Account Association
              </span>
              <span className="text-slate-700 font-medium line-clamp-1 mt-0.5">
                {c.accountId ? `Account: ${c.accountId.slice(0, 8)}…` : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* DNC tag if active */}
          {c.doNotContact && (
            <div className="pt-1">
              <Badge
                variant="destructive"
                className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
              >
                <Ban className="w-2.5 h-2.5" />
                <span>Do Not Contact (DNC)</span>
              </Badge>
            </div>
          )}

          {/* Bottom row: Updated date & Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span className="text-[11px] text-slate-400 font-mono">
              Updated: {formatDate(c.updatedAt)}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-[3px] text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  aria-label={`Actions for ${c.displayName}`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-[3px] text-xs font-sans">
                <DropdownMenuItem
                  onClick={() => onView(c)}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Details</span>
                </DropdownMenuItem>

                {canWrite && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onEdit(c)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Contact</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDelete(c)}
                      className="gap-2 cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Contact</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
