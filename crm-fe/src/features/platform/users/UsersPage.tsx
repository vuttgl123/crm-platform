import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Plus,
  Loader2,
  UserCheck,
  RotateCcw,
  MoreHorizontal,
  Eye,
  Edit,
  ShieldAlert,
  UserX,
  UserCheck2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { StandardGlidingTabs, TabItem } from '@/components/common/StandardGlidingTabs';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { useAuth } from '@/core/session/useAuth';
import { CreateUserWizardModal } from './components/CreateUserWizardModal';
import { UserEditorSheet } from './components/UserEditorSheet';
import {
  membershipApi,
  MembershipRequestItem,
} from '@/services/api/membershipApi';
import { roleApi, RoleSummaryResponse } from '@/services/api/roleApi';
import {
  userApi,
  PlatformUserItem,
  UserStatsData,
} from '@/services/api/userApi';

type UserTab = 'active' | 'pending';

export const UsersPage: React.FC = () => {
  const { session } = useAuth();
  const hasManagePermission =
    Boolean(session?.membership?.is_tenant_admin) ||
    Boolean(session?.grantedPermissions?.includes('platform_user.manage'));

  const [activeTab, setActiveTab] = useState<UserTab>('active');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<UserStatsData | null>(null);

  // Active Users Data & Filtering
  const [activeUsers, setActiveUsers] = useState<PlatformUserItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pending Membership Requests Data
  const [pendingRequests, setPendingRequests] = useState<MembershipRequestItem[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Record<string, string>>({});

  // Roles Catalog
  const [roles, setRoles] = useState<RoleSummaryResponse[]>([]);

  // Modals & Sheets
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [editorSheet, setEditorSheet] = useState<{
    isOpen: boolean;
    mode: 'view' | 'edit';
    user: PlatformUserItem | null;
  }>({
    isOpen: false,
    mode: 'view',
    user: null,
  });

  // Fetch Roles Catalog
  const fetchRoles = useCallback(async () => {
    try {
      const availableRoles = await roleApi.getRoles();
      setRoles(availableRoles || []);
    } catch {
      setRoles([]);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const s = await userApi.getUserStats();
      setStats(s);
    } catch {
      // Fallback
    }
  }, []);

  // Fetch Active Users (Server-side search & pagination)
  const fetchActiveUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.searchUsers({
        query: searchQuery.trim() || undefined,
        roleId: selectedRoleFilter !== 'ALL' ? selectedRoleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: currentPage - 1,
        size: pageSize,
      });

      setActiveUsers(res?.items || []);
      setTotalUsers(res?.totalElements || 0);
    } catch {
      setActiveUsers([]);
      setTotalUsers(0);
      toast.error('Unable to retrieve user directory from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRoleFilter, statusFilter, currentPage, pageSize]);

  // Fetch Pending Requests
  const fetchMembershipRequests = useCallback(async () => {
    try {
      const res = await membershipApi.searchRequests();
      const allRequests: MembershipRequestItem[] = res?.items || (Array.isArray(res) ? res : []);
      const pending = allRequests.filter((r) => r.status === 'PENDING');
      setPendingRequests(pending);

      const initialRoleMap: Record<string, string> = {};
      pending.forEach((req) => {
        initialRoleMap[req.id] = roles[0]?.id || '';
      });
      setSelectedRoleIds((prev) => ({ ...initialRoleMap, ...prev }));
    } catch {
      setPendingRequests([]);
    }
  }, [roles]);

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, [fetchRoles, fetchStats]);

  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveUsers();
    } else {
      fetchMembershipRequests();
    }
  }, [activeTab, fetchActiveUsers, fetchMembershipRequests]);

  const handleRefresh = () => {
    fetchStats();
    if (activeTab === 'active') {
      fetchActiveUsers();
    } else {
      fetchMembershipRequests();
    }
  };

  const handleApprove = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('You do not have platform_user.manage permission to approve accounts.');
      return;
    }

    const selectedRoleId = selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '');
    setActionLoadingId(req.id);
    try {
      await membershipApi.approveRequest(req.id, {
        version: req.version,
        roleIds: selectedRoleId ? [selectedRoleId] : [],
      });

      toast.success(`Approved account "${req.requester.displayName || req.requester.email}" successfully!`);
      fetchMembershipRequests();
      fetchStats();
      fetchActiveUsers();
    } catch {
      toast.error('Failed to approve membership request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('You do not have platform_user.manage permission to reject accounts.');
      return;
    }

    setActionLoadingId(req.id);
    try {
      await membershipApi.rejectRequest(req.id, {
        version: req.version,
        reason: 'Administrative rejection by Tenant Administrator',
      });

      toast.info(`Rejected request from "${req.requester.displayName || req.requester.email}".`);
      fetchMembershipRequests();
      fetchStats();
    } catch {
      toast.error('Failed to reject membership request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuspend = async (user: PlatformUserItem) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await userApi.changeUserStatus(user.id, newStatus);
      toast.success(`Member status updated to ${newStatus}`);
      fetchActiveUsers();
      fetchStats();
    } catch {
      toast.error('Failed to update member status');
    }
  };

  const handleDeleteUser = async (user: PlatformUserItem) => {
    if (!confirm(`Are you sure you want to remove ${user.displayName} from this organization?`)) return;
    try {
      await userApi.deleteUser(user.id);
      toast.success(`Member ${user.displayName} removed from organization`);
      fetchActiveUsers();
      fetchStats();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const tabs: TabItem<UserTab>[] = [
    {
      id: 'active',
      label: 'Active Members',
      icon: Users,
      badge: totalUsers,
    },
    {
      id: 'pending',
      label: 'Pending Join Requests',
      icon: Clock,
      badge: pendingRequests.length,
    },
  ];

  const roleFilterOptions = [
    { value: 'ALL', label: 'All Security Roles' },
    ...roles.map((r) => ({
      value: r.id,
      label: r.name,
      description: r.description,
    })),
  ];

  const statusFilterOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active Only' },
    { value: 'SUSPENDED', label: 'Suspended Only' },
    { value: 'INVITED', label: 'Invited Only' },
  ];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Tenant Workforce & Access Directory"
        subtitle="Manage employee memberships, provision user accounts, enforce security roles, and review organization join requests."
        badgeLabel="members"
        badgeCount={totalUsers}
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh user directory">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </ActionTooltip>

            {hasManagePermission && (
              <Button
                size="sm"
                onClick={() => setIsCreateWizardOpen(true)}
                className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-2xs h-8 rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision Member</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-[#0C66E4]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Directory</div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {stats?.totalMembers ?? totalUsers}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Active Members</div>
            <div className="text-base font-black text-emerald-700 leading-tight">
              {stats?.activeMembers ?? totalUsers}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tenant Admins</div>
            <div className="text-base font-black text-purple-700 leading-tight">
              {stats?.tenantAdmins ?? 1}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Pending Requests</div>
            <div className="text-base font-black text-amber-700 leading-tight">
              {stats?.pendingJoinRequests ?? pendingRequests.length}
            </div>
          </div>
        </div>
      </div>

      {/* Gliding Tabs */}
      <StandardGlidingTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Active Directory */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, or employee code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 text-xs pl-8 bg-slate-50/60 focus:bg-white rounded-[3px] border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-48">
                <SearchableSelect
                  options={roleFilterOptions}
                  value={selectedRoleFilter}
                  onChange={(val) => {
                    setSelectedRoleFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by Role..."
                />
              </div>

              <div className="w-36">
                <SearchableSelect
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Status..."
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3">Member Profile</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3">Security Role</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3">Team / Department</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3">Status</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3">Last Active</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0C66E4]" />
                        <span>Loading active member directory...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : activeUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12">
                      <EmptyState
                        title="No Members Found"
                        description="No team members match the search query or active filter."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  activeUsers.map((user) => {
                    const initials = user.displayName
                      ? user.displayName
                          .split(' ')
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'U';

                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0C66E4] font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{user.displayName}</span>
                                {user.isTenantAdmin && (
                                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-bold rounded-[2px] px-1 py-0">
                                    ADMIN
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((r) => (
                                <Badge
                                  key={r.id}
                                  variant="outline"
                                  className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-medium rounded-[2px]"
                                >
                                  {r.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs">Standard Member</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="text-slate-800 font-medium truncate">
                            {user.primaryTeam ? user.primaryTeam.name : user.jobTitle || 'Commercial Operations'}
                          </div>
                          {user.employeeReference && (
                            <div className="text-[10px] font-mono text-slate-400">
                              ID: {user.employeeReference}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="py-2.5">
                          <Badge
                            className={`text-[10px] font-bold rounded-[2px] ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : user.status === 'SUSPENDED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-2.5 font-mono text-[11px] text-slate-500">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })
                            : 'Never'}
                        </TableCell>

                        <TableCell className="py-2.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <ActionTooltip label="View Details">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditorSheet({ isOpen: true, mode: 'view', user })}
                                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 rounded-[3px]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </ActionTooltip>

                            {hasManagePermission && (
                              <ActionTooltip label="Edit Member Profile">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditorSheet({ isOpen: true, mode: 'edit', user })}
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 rounded-[3px]"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </ActionTooltip>
                            )}

                            {hasManagePermission && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 rounded-[3px]"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 text-xs rounded-[3px]">
                                  <DropdownMenuItem
                                    onClick={() => handleToggleSuspend(user)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    {user.status === 'ACTIVE' ? (
                                      <>
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Suspend Member</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Reactivate Member</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="gap-2 text-rose-600 cursor-pointer hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove from Tenant</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Standard Pagination */}
            <StandardPagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalUsers / pageSize) || 1}
              totalElements={totalUsers}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Pending Join Requests */}
      {activeTab === 'pending' && (
        <div className="border border-slate-200 rounded-[4px] bg-white shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700 py-3">Applicant Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 py-3">Email Address</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 py-3">Request Notes</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 py-3">Submitted At</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 py-3">Assign Security Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 py-3 text-right pr-4">Review Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs">
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12">
                    <EmptyState
                      title="No Pending Requests"
                      description="All employee registration and membership join requests have been processed."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/50">
                    <TableCell className="py-2.5 font-bold text-slate-900">
                      {req.requester.displayName || 'External Applicant'}
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-slate-600">
                      {req.requester.email}
                    </TableCell>
                    <TableCell className="py-2.5 text-slate-500 max-w-xs truncate">
                      {req.requestNotes || 'No notes provided'}
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-[11px] text-slate-500">
                      {new Date(req.requestedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="w-48">
                        <SearchableSelect
                          options={roles.map((r) => ({
                            value: r.id,
                            label: r.name,
                            description: r.description,
                          }))}
                          value={selectedRoleIds[req.id] || roles[0]?.id || ''}
                          onChange={(val) =>
                            setSelectedRoleIds((prev) => ({ ...prev, [req.id]: val }))
                          }
                          placeholder="Select Role..."
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleReject(req)}
                          className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[3px] gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>

                        <Button
                          size="sm"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleApprove(req)}
                          className="h-7 text-xs bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 font-medium shadow-2xs"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Grant Access</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Wizard Modal */}
      <CreateUserWizardModal
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        roles={roles}
        onUserCreated={() => {
          fetchActiveUsers();
          fetchStats();
        }}
      />

      {/* View & Edit User Slide-over Sheet */}
      <UserEditorSheet
        isOpen={editorSheet.isOpen}
        mode={editorSheet.mode}
        user={editorSheet.user}
        roles={roles}
        canManage={hasManagePermission}
        onClose={() => setEditorSheet({ ...editorSheet, isOpen: false })}
        onSwitchMode={(mode) => setEditorSheet({ ...editorSheet, mode })}
        onUserSaved={() => {
          fetchActiveUsers();
          fetchStats();
        }}
      />
    </div>
  );
};

export default UsersPage;
