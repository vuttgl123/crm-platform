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
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import {
  AccountSummaryResponse,
  AccountViewMode,
} from '../model/accountTypes';
import {
  buildAccountTree,
  flattenAccountTree,
} from '../model/accountTree';
import { useOwnerResolver } from '../hooks/useOwnerResolver';
import {
  Eye,
  Edit,
  Trash2,
  GitFork,
  MoreHorizontal,
  User,
  Users,
  Ban,
  ChevronRight,
  Building2,
  CornerDownRight,
} from 'lucide-react';

interface AccountsTableProps {
  accounts: AccountSummaryResponse[];
  viewMode: AccountViewMode;
  expandedIds: Set<string>;
  canWrite: boolean;
  onToggleExpand: (accountId: string) => void;
  onEdit: (account: AccountSummaryResponse) => void;
  onAddSubsidiary: (account: AccountSummaryResponse) => void;
  onDelete: (account: AccountSummaryResponse) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  viewMode,
  expandedIds,
  canWrite,
  onToggleExpand,
  onEdit,
  onAddSubsidiary,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  // Create quick lookup map for parent names
  const accountMap = React.useMemo(() => {
    const map = new Map<string, AccountSummaryResponse>();
    accounts.forEach((acc) => map.set(acc.id, acc));
    return map;
  }, [accounts]);

  // Build tree & flattened nodes
  const treeNodes = React.useMemo(() => {
    if (viewMode !== 'tree') return [];
    return buildAccountTree(accounts);
  }, [accounts, viewMode]);

  const flattenedTree = React.useMemo(() => {
    if (viewMode !== 'tree') return [];
    return flattenAccountTree(treeNodes, expandedIds);
  }, [treeNodes, expandedIds, viewMode]);

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[280px]">
                {viewMode === 'tree' ? 'Account Hierarchy (Tree)' : 'Account'}
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Type
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Lifecycle
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Parent Account
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Owner
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Contact Preference
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Updated
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4 w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewMode === 'tree'
              ? flattenedTree.map(({ node, hasChildren, childCount }) => {
                  const acc = node.account;
                  const isExpanded = expandedIds.has(acc.id);
                  const parentName = acc.parentAccountId
                    ? accountMap.get(acc.parentAccountId)?.displayName || `Account: ${acc.parentAccountId.slice(0, 8)}…`
                    : null;
                  const ownerInfo = resolveOwner(acc.owner);

                  return (
                    <TableRow
                      key={acc.id}
                      className={`hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors ${
                        node.level > 0 ? 'bg-slate-50/50 animate-tree-row' : ''
                      }`}
                    >
                      {/* Hierarchical Tree Cell */}
                      <TableCell className="py-2.5 px-3">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${node.level * 22}px` }}
                        >
                          {/* Tree Expand/Collapse Button or Leaf Branch Icon */}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => onToggleExpand(acc.id)}
                              className="p-1 rounded-[3px] text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors shrink-0"
                              title={isExpanded ? 'Collapse subsidiaries' : 'Expand subsidiaries'}
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90 text-blue-600 font-bold' : 'text-slate-500'
                                }`}
                              />
                            </button>
                          ) : node.level > 0 ? (
                            <div className="w-5 flex items-center justify-center shrink-0">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          ) : (
                            <div className="w-5 flex items-center justify-center shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}

                          {/* Account Identity */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/app/crm/accounts/${acc.id}`}
                                className={`text-xs hover:text-blue-600 text-left line-clamp-1 transition-colors ${
                                  node.level === 0
                                    ? 'font-bold text-slate-900'
                                    : 'font-semibold text-slate-800'
                                }`}
                              >
                                {acc.displayName}
                              </Link>

                              {hasChildren && (
                                <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-[2px] shrink-0">
                                  {childCount} {childCount === 1 ? 'sub' : 'subs'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-400">
                                {acc.accountNumber}
                              </span>
                              {acc.legalName && (
                                <span className="text-[10px] text-slate-500 italic line-clamp-1">
                                  • {acc.legalName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-2.5 px-3">
                        {renderAccountTypeBadge(acc.accountType)}
                      </TableCell>

                      {/* Lifecycle */}
                      <TableCell className="py-2.5 px-3">
                        {renderLifecycleStageBadge(acc.lifecycleStage)}
                      </TableCell>

                      {/* Parent Account */}
                      <TableCell className="py-2.5 px-3">
                        {acc.parentAccountId ? (
                          <Link
                            to={`/app/crm/accounts/${acc.parentAccountId}`}
                            className="font-medium text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 line-clamp-1"
                          >
                            <span>{parentName}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">None (Root)</span>
                        )}
                      </TableCell>

                      {/* Owner with friendly resolved name */}
                      <TableCell className="py-2.5 px-3">
                        {acc.owner ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            {ownerInfo.type === 'USER' ? (
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <div className="flex flex-col truncate">
                              <span
                                className={`truncate line-clamp-1 ${
                                  ownerInfo.isCurrentUser
                                    ? 'font-bold text-slate-900'
                                    : 'font-medium text-slate-700'
                                }`}
                              >
                                {ownerInfo.label}
                              </span>
                              {ownerInfo.subLabel && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  {ownerInfo.subLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Contact Preference */}
                      <TableCell className="py-2.5 px-3">
                        {acc.doNotContact ? (
                          <Badge
                            variant="destructive"
                            className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
                          >
                            <Ban className="w-2.5 h-2.5" />
                            <span>Do Not Contact</span>
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Standard Allowed</span>
                        )}
                      </TableCell>

                      {/* Updated */}
                      <TableCell className="py-2.5 px-3 text-xs text-slate-500 font-mono">
                        {formatDate(acc.updatedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                              <DropdownMenuItem asChild className="gap-2 text-xs">
                                <Link to={`/app/crm/accounts/${acc.id}`}>
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View 360° Workspace</span>
                                </Link>
                              </DropdownMenuItem>

                              {canWrite && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onAddSubsidiary(acc)}
                                    className="gap-2 text-xs"
                                  >
                                    <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Add Subsidiary</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onEdit(acc)}
                                    className="gap-2 text-xs"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit Account</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDelete(acc)}
                                    className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Account</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              : accounts.map((acc) => {
                  const parentName = acc.parentAccountId
                    ? accountMap.get(acc.parentAccountId)?.displayName || `Account: ${acc.parentAccountId.slice(0, 8)}…`
                    : null;
                  const ownerInfo = resolveOwner(acc.owner);

                  return (
                    <TableRow
                      key={acc.id}
                      className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                    >
                      {/* Flat Account Name & Number */}
                      <TableCell className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <Link
                            to={`/app/crm/accounts/${acc.id}`}
                            className="font-bold text-xs text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                          >
                            {acc.displayName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-400">
                              {acc.accountNumber}
                            </span>
                            {acc.legalName && (
                              <span className="text-[10px] text-slate-500 italic line-clamp-1">
                                • {acc.legalName}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-2.5 px-3">
                        {renderAccountTypeBadge(acc.accountType)}
                      </TableCell>

                      {/* Lifecycle */}
                      <TableCell className="py-2.5 px-3">
                        {renderLifecycleStageBadge(acc.lifecycleStage)}
                      </TableCell>

                      {/* Parent Account */}
                      <TableCell className="py-2.5 px-3">
                        {acc.parentAccountId ? (
                          <Link
                            to={`/app/crm/accounts/${acc.parentAccountId}`}
                            className="font-medium text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 line-clamp-1"
                          >
                            <span>{parentName}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">None (Root)</span>
                        )}
                      </TableCell>

                      {/* Owner with friendly resolved name */}
                      <TableCell className="py-2.5 px-3">
                        {acc.owner ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            {ownerInfo.type === 'USER' ? (
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <div className="flex flex-col truncate">
                              <span
                                className={`truncate line-clamp-1 ${
                                  ownerInfo.isCurrentUser
                                    ? 'font-bold text-slate-900'
                                    : 'font-medium text-slate-700'
                                }`}
                              >
                                {ownerInfo.label}
                              </span>
                              {ownerInfo.subLabel && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  {ownerInfo.subLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Contact Preference */}
                      <TableCell className="py-2.5 px-3">
                        {acc.doNotContact ? (
                          <Badge
                            variant="destructive"
                            className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
                          >
                            <Ban className="w-2.5 h-2.5" />
                            <span>Do Not Contact</span>
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Standard Allowed</span>
                        )}
                      </TableCell>

                      {/* Updated */}
                      <TableCell className="py-2.5 px-3 text-xs text-slate-500 font-mono">
                        {formatDate(acc.updatedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                              <DropdownMenuItem asChild className="gap-2 text-xs">
                                <Link to={`/app/crm/accounts/${acc.id}`}>
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View 360° Workspace</span>
                                </Link>
                              </DropdownMenuItem>

                              {canWrite && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onAddSubsidiary(acc)}
                                    className="gap-2 text-xs"
                                  >
                                    <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Add Subsidiary</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onEdit(acc)}
                                    className="gap-2 text-xs"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit Account</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDelete(acc)}
                                    className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Account</span>
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
