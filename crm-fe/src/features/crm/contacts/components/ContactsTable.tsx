import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { renderLifecycleStageBadge } from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import { ContactSummaryResponse } from '@/services/api/contactApi';
import {
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Ban,
  User,
  Users,
  Mail,
  Phone,
  Smartphone,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';

interface ContactsTableProps {
  contacts: ContactSummaryResponse[];
  canWrite: boolean;
  onView: (contact: ContactSummaryResponse) => void;
  onEdit: (contact: ContactSummaryResponse) => void;
  onDelete: (contact: ContactSummaryResponse) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  canWrite,
  onView,
  onEdit,
  onDelete,
}) => {
  const renderChannelIcon = (channel?: string | null) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-slate-500" />;
      case 'MOBILE':
      case 'SMS':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 w-[220px]">
                Contact
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 w-[180px]">
                Account
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Role &amp; Department
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Ownership
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Preference
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Lifecycle Stage
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Updated
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4 w-[60px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow
                key={c.id}
                className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
              >
                {/* Column 1: Contact Name & Number */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => onView(c)}
                      className="font-bold text-xs text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                    >
                      {c.displayName}
                    </button>
                    <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded-[2px] border border-slate-200/80 text-slate-600 w-fit">
                      {c.contactNumber}
                    </span>
                  </div>
                </TableCell>

                {/* Column 2: Account Association */}
                <TableCell className="py-2.5 px-3">
                  {c.accountId ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-600 truncate max-w-[90px]">
                        {c.accountId.slice(0, 8)}…
                      </span>
                      <ActionTooltip label="Open linked account">
                        <Link
                          to={`/app/crm/accounts/${c.accountId}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 text-xs font-medium"
                          aria-label={`Open account for ${c.displayName}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </ActionTooltip>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No linked account
                    </span>
                  )}
                </TableCell>

                {/* Column 3: Role & Department */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-800 line-clamp-1">
                      {c.jobTitle || '—'}
                    </span>
                    {c.department && (
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {c.department}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Column 4: Ownership */}
                <TableCell className="py-2.5 px-3">
                  {c.owner ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      {c.owner.type === 'USER' ? (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="font-mono text-[11px]">
                        {c.owner.type === 'USER' ? 'User' : 'Team'}: {c.owner.id.slice(0, 6)}…
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </TableCell>

                {/* Column 5: Preference & DNC */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.preferredContactChannel ? (
                      <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                        {renderChannelIcon(c.preferredContactChannel)}
                        <span className="text-[11px]">{c.preferredContactChannel}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}

                    {c.doNotContact && (
                      <Badge
                        variant="destructive"
                        className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
                      >
                        <Ban className="w-2.5 h-2.5" />
                        <span>DNC</span>
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Column 6: Lifecycle Stage */}
                <TableCell className="py-2.5 px-3">
                  {renderLifecycleStageBadge(c.lifecycleStage)}
                </TableCell>

                {/* Column 7: Updated Time */}
                <TableCell className="py-2.5 px-3 text-xs text-slate-500 font-mono">
                  {formatDate(c.updatedAt)}
                </TableCell>

                {/* Column 8: Standard 3-Dot Actions */}
                <TableCell className="py-2.5 px-3 text-right pr-4">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
