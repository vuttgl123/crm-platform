import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  RotateCcw,
  User,
  MoreHorizontal,
  Eye,
  Edit,
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
  DropdownMenuSeparator,
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
import { StandardGlidingTabs } from '@/components/common/StandardGlidingTabs';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { useAuth } from '@/core/session/useAuth';
import { CreateUserWizardModal } from './components/CreateUserWizardModal';
import { UserEditorSheet } from './components/UserEditorSheet';
import {
  membershipApi,
  MembershipRequestItem,
} from '@/services/api/membershipApi';
import { roleApi, RoleSummaryResponse } from '@/services/api/roleApi';

export interface ActiveUser {
  id: string;
  displayName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
  isTenantAdmin?: boolean;
  requestId?: string;
  requestVersion?: number;
}

export const UsersPage: React.FC = () => {
  const { session } = useAuth();
  const hasManagePermission =
    Boolean(session?.membership?.is_tenant_admin) ||
    Boolean(session?.grantedPermissions?.includes('platform_user.manage'));

  const [pendingRequests, setPendingRequests] = useState<MembershipRequestItem[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<RoleSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Slide-over View & Edit Sheet state
  const [editorSheet, setEditorSheet] = useState<{
    isOpen: boolean;
    mode: 'view' | 'edit';
    user: ActiveUser | null;
  }>({
    isOpen: false,
    mode: 'view',
    user: null,
  });

  // Pagination State for Active Users
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Real Roles Catalog from Backend API
  const fetchRoles = useCallback(async () => {
    try {
      const availableRoles = await roleApi.getRoles();
      setRoles(availableRoles || []);
    } catch {
      setRoles([]);
    }
  }, []);

  // Fetch Both Pending Requests and Approved Active Members from Backend API
  const fetchMembershipRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await membershipApi.searchRequests();
      const allRequests: MembershipRequestItem[] = res?.items || (Array.isArray(res) ? res : []);

      // 1. Filter PENDING requests
      const pending = allRequests.filter((r) => r.status === 'PENDING');
      setPendingRequests(pending);

      // Auto-assign default role ID in state for pending items
      const initialRoleMap: Record<string, string> = {};
      pending.forEach((req) => {
        initialRoleMap[req.id] = roles[0]?.id || '';
      });
      setSelectedRoleIds((prev) => ({ ...initialRoleMap, ...prev }));

      // 2. Filter APPROVED requests -> Active Users
      const approved = allRequests.filter((r) => r.status === 'APPROVED');
      const realActiveUsers: ActiveUser[] = approved.map((req) => {
        return {
          id: req.requester.id,
          displayName: req.requester.displayName || req.requester.email.split('@')[0],
          email: req.requester.email,
          roleId: roles[0]?.id || 'role-member',
          roleName: 'Enterprise Member',
          status: 'ACTIVE',
          joinedAt: req.reviewedAt || req.requestedAt || new Date().toISOString(),
          isTenantAdmin: false,
          requestId: req.id,
          requestVersion: req.version,
        };
      });

      // 3. Add Current Session User as Tenant Admin if not present
      if (session?.user) {
        const sessionUserId = session.user.id;
        const exists = realActiveUsers.some((u) => u.id === sessionUserId || u.email === session.user?.email);
        if (!exists) {
          realActiveUsers.unshift({
            id: sessionUserId,
            displayName: session.user.display_name || session.user.email?.split('@')[0] || 'Administrator',
            email: session.user.email || 'admin@enterprise.com',
            roleId: 'role-admin',
            roleName: session.membership?.is_tenant_admin ? 'Tenant Admin (Master)' : 'Platform Administrator',
            status: 'ACTIVE',
            joinedAt: new Date().toISOString(),
            isTenantAdmin: Boolean(session.membership?.is_tenant_admin),
          });
        }
      }

      // 4. Enrich with custom local demo accounts
      const enrichedUsers = realActiveUsers.map((u) => {
        const savedRoleId = localStorage.getItem(`user_role_${u.id}`);
        if (savedRoleId) {
          const match = roles.find((r) => r.id === savedRoleId);
          if (match) {
            return { ...u, roleId: match.id, roleName: match.name };
          }
        }
        return u;
      });

      setActiveUsers(enrichedUsers);
    } catch {
      toast.error('Unable to retrieve membership data from server');
    } finally {
      setLoading(false);
    }
  }, [roles, session]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchMembershipRequests();
  }, [fetchMembershipRequests]);

  const activePendingCount = pendingRequests.length;

  const getEffectiveRoleId = (user: ActiveUser) => {
    return user.roleId || (roles[0] ? roles[0].id : '');
  };

  const handleApprove = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('You do not have platform_user.manage permission to approve accounts.');
      return;
    }

    const selectedRoleId = selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '');
    const assignedRole = roles.find((r) => r.id === selectedRoleId);

    setActionLoadingId(req.id);
    try {
      await membershipApi.approveRequest(req.id, {
        version: req.version,
        roleIds: selectedRoleId ? [selectedRoleId] : [],
      });

      toast.success(`Approved account "${req.requester.displayName || req.requester.email}" successfully!`);

      const approvedUser: ActiveUser = {
        id: req.requester.id,
        displayName: req.requester.displayName || req.requester.email,
        email: req.requester.email,
        roleId: selectedRoleId,
        roleName: assignedRole?.name || 'Enterprise Member',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        isTenantAdmin: false,
        requestId: req.id,
        requestVersion: req.version + 1,
      };

      setActiveUsers((prev) => [approvedUser, ...prev.filter((u) => u.id !== approvedUser.id)]);
      fetchMembershipRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to approve membership request.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeMemberRole = async (userId: string, newRoleId: string) => {
    const selectedRole = roles.find((r) => r.id === newRoleId);
    if (!selectedRole) return;

    const user = activeUsers.find((u) => u.id === userId);
    if (!user) return;

    localStorage.setItem(`user_role_${userId}`, newRoleId);

    setActiveUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId, roleName: selectedRole.name } : u))
    );

    try {
      await membershipApi.updateMemberRoles(userId, [newRoleId]);
      toast.success(`Updated role [${selectedRole.name}] for [${user.displayName}]!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to save updated role.';
      toast.error(msg);
    }
  };

  const handleReject = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('You do not have platform_user.manage permission to reject accounts.');
      return;
    }

    const reason = window.prompt(`Enter rejection reason for "${req.requester.displayName || req.requester.email}":`);
    if (reason === null) return;

    setActionLoadingId(req.id);
    try {
      await membershipApi.rejectRequest(req.id, {
        version: req.version,
        reason: reason.trim() || 'Declined per tenant administrative policy.',
      });

      toast.info(`Declined membership request for "${req.requester.displayName || req.requester.email}".`);
      fetchMembershipRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to decline request.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered & Paginated Active Users
  const filteredActiveUsers = useMemo(() => {
    return activeUsers.filter((u) => {
      const matchesSearch =
        searchQuery === '' ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRoleFilter === 'ALL' ||
        u.roleId === selectedRoleFilter ||
        (roles.find((r) => r.id === selectedRoleFilter)?.name === u.roleName);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ADMIN' ? u.isTenantAdmin : u.status === statusFilter);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [activeUsers, searchQuery, selectedRoleFilter, statusFilter, roles]);

  const totalPages = Math.max(1, Math.ceil(filteredActiveUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActiveUsers.slice(start, start + pageSize);
  }, [filteredActiveUsers, currentPage, pageSize]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedRoleFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // View / Edit Sheet Handlers
  const handleOpenView = (user: ActiveUser) => {
    setEditorSheet({
      isOpen: true,
      mode: 'view',
      user,
    });
  };

  const handleOpenEdit = (user: ActiveUser) => {
    setEditorSheet({
      isOpen: true,
      mode: 'edit',
      user,
    });
  };

  const handleCloseEditorSheet = () => {
    setEditorSheet((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveUser = async (updatedUser: ActiveUser) => {
    try {
      setActiveUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      localStorage.setItem(`user_role_${updatedUser.id}`, updatedUser.roleId);
      await membershipApi.updateMemberRoles(updatedUser.id, [updatedUser.roleId]);
      toast.success(`Updated profile for [${updatedUser.displayName}]!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to update user profile.';
      toast.error(msg);
    }
  };

  // Helper for Initials
  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
    );
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Users & Governance"
        subtitle="Manage organization membership, approve inbound access requests, and assign security roles."
        badgeCount={activeUsers.length}
        badgeLabel="members"
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh member directory">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMembershipRequests}
                disabled={loading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-[3px] gap-1.5"
                aria-label="Refresh users"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ActionTooltip>

            {hasManagePermission && (
              <Button
                size="sm"
                onClick={() => setIsCreateWizardOpen(true)}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
                aria-label="Register new member"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Member</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Quick Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Members</div>
            <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">{activeUsers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-amber-200/80 p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[4px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Pending Approval</div>
            <div className="text-base font-bold text-amber-700 leading-tight mt-0.5">{pendingRequests.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-200/80 p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Seats</div>
            <div className="text-base font-bold text-emerald-700 leading-tight mt-0.5">
              {activeUsers.filter((u) => u.status === 'ACTIVE').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-200/80 p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[4px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Administrators</div>
            <div className="text-base font-bold text-purple-700 leading-tight mt-0.5">
              {activeUsers.filter((u) => u.isTenantAdmin).length}
            </div>
          </div>
        </div>
      </div>

      {/* Standard Gliding Tabs */}
      <StandardGlidingTabs
        tabs={[
          {
            id: 'active',
            label: 'Active Members',
            icon: UserCheck,
            badge: activeUsers.length,
          },
          {
            id: 'pending',
            label: 'Pending Requests',
            icon: Clock,
            badge: activePendingCount > 0 ? activePendingCount : undefined,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: ACTIVE MEMBERS */}
      {activeTab === 'active' && (
        <div className="animate-tab-content space-y-4">
          {/* Toolbar */}
          <div className="bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2.5 w-full flex-wrap sm:flex-nowrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search member by name, email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-7 text-xs h-8 border-slate-200 rounded-[3px] bg-white w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <SearchableSelect
                options={[
                  { value: 'ALL', label: `All Roles (${roles.length})` },
                  ...roles.map((r) => ({
                    value: r.id,
                    label: r.roleCode || r.name,
                  })),
                ]}
                value={selectedRoleFilter}
                onValueChange={(val) => {
                  setSelectedRoleFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="All Roles"
                searchPlaceholder="Search roles..."
                triggerClassName="h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white min-w-[160px]"
                popoverClassName="w-56"
                className="w-auto"
              />

              {/* Status Filter */}
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'ADMIN', label: 'Administrator' },
                ]}
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="All Statuses"
                searchPlaceholder="Filter status..."
                triggerClassName="h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white min-w-[130px]"
                className="w-auto"
              />

              {/* Reset Filter Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-[3px] gap-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans shadow-2xs">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="text-xs">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Member Name
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Work Email
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Assigned Role
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Joined Date
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading team members from backend...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredActiveUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6">
                      <EmptyState
                        icon={Users}
                        title={searchQuery || activeFiltersCount > 0 ? 'No members matching filter' : 'No team members registered'}
                        description={searchQuery || activeFiltersCount > 0 ? 'Try searching with different keywords or clearing active filters.' : 'Get started by inviting team members or approving join requests.'}
                        actionLabel={activeFiltersCount > 0 ? undefined : 'Add Member'}
                        onAction={activeFiltersCount > 0 ? undefined : () => setIsCreateWizardOpen(true)}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const effectiveRoleId = getEffectiveRoleId(user);
                    return (
                      <TableRow key={user.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0]">
                        <TableCell className="font-semibold text-slate-900 text-xs py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[3px] bg-blue-50 text-blue-700 font-bold text-[11px] flex items-center justify-center border border-blue-100 shrink-0">
                              {getInitials(user.displayName)}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenView(user)}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left cursor-pointer"
                              >
                                {user.displayName}
                              </button>
                              {user.isTenantAdmin && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[9px] px-1.5 py-0.2 rounded-[2px]">
                                  ADMIN
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono py-2.5 px-3">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 px-3">
                          {user.isTenantAdmin ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[2px] border border-blue-200 w-fit">
                              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{user.roleName}</span>
                            </div>
                          ) : (
                            <SearchableSelect
                              options={roles.map((r) => ({
                                value: r.id,
                                label: r.roleCode || r.name,
                              }))}
                              value={effectiveRoleId}
                              onValueChange={(val) => handleChangeMemberRole(user.id, val)}
                              placeholder="Select role..."
                              searchPlaceholder="Search roles..."
                              triggerClassName="h-7 text-xs font-medium rounded-[3px] border-slate-200 bg-white"
                              popoverClassName="w-56"
                              className="w-48"
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 px-3">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]">
                            ACTIVE
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono py-2.5 px-3">
                          {new Date(user.joinedAt).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-2.5 px-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-[3px] text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                aria-label={`Actions for ${user.displayName}`}
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-[3px] text-xs font-sans">
                              <DropdownMenuItem
                                onClick={() => handleOpenView(user)}
                                className="gap-2 cursor-pointer text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Details</span>
                              </DropdownMenuItem>

                              {hasManagePermission && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleOpenEdit(user)}
                                    className="gap-2 cursor-pointer text-xs"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit Member</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Standard Pagination Bar */}
            {!loading && filteredActiveUsers.length > 0 && (
              <StandardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={filteredActiveUsers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="members"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING MEMBERSHIP REQUESTS */}
      {activeTab === 'pending' && (
        <div className="animate-tab-content space-y-4">
          <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans shadow-2xs">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="text-xs">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Requester
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Work Email
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Requested At
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                    Assign Security Role
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading registration requests from server...</span>
                    </TableCell>
                  </TableRow>
                ) : pendingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={CheckCircle2}
                        title="No pending membership requests"
                        description="All access requests to join this organization have been reviewed."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0]">
                      <TableCell className="font-semibold text-slate-900 text-xs py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-[3px] bg-amber-50 text-amber-700 font-bold text-[11px] flex items-center justify-center border border-amber-200 shrink-0">
                            {getInitials(req.requester.displayName || req.requester.email)}
                          </div>
                          <span>{req.requester.displayName || req.requester.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono py-2.5 px-3">
                        {req.requester.email}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono py-2.5 px-3">
                        {new Date(req.requestedAt).toLocaleString('en-US')}
                      </TableCell>
                      <TableCell className="text-xs py-2.5 px-3">
                        <SearchableSelect
                          options={roles.map((r) => ({
                            value: r.id,
                            label: r.roleCode || r.name,
                          }))}
                          value={selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '')}
                          onValueChange={(val) => setSelectedRoleIds((prev) => ({ ...prev, [req.id]: val }))}
                          placeholder="Select role..."
                          searchPlaceholder="Search roles..."
                          triggerClassName="h-7 text-xs font-medium rounded-[3px] border-slate-200 bg-white"
                          popoverClassName="w-56"
                          className="w-48"
                        />
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2.5 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoadingId === req.id}
                            className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-[3px]"
                          >
                            {actionLoadingId === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Approve</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req)}
                            disabled={actionLoadingId === req.id}
                            className="h-7 px-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 rounded-[3px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create User Wizard Modal */}
      <CreateUserWizardModal
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        roles={roles}
        onUserCreated={() => fetchMembershipRequests()}
      />

      {/* User Detail & Editor Sheet */}
      <UserEditorSheet
        isOpen={editorSheet.isOpen}
        mode={editorSheet.mode}
        user={editorSheet.user}
        roles={roles}
        canManage={hasManagePermission}
        onClose={handleCloseEditorSheet}
        onSwitchMode={(mode) => setEditorSheet((prev) => ({ ...prev, mode }))}
        onSaveUser={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;
