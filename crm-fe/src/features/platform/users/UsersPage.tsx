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
  RefreshCw,
  Loader2,
  UserCheck,
  X,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
import { useAuth } from '@/core/session/useAuth';
import { CreateUserWizardModal } from './components/CreateUserWizardModal';
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

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Users &amp; Tenant Membership"
        subtitle="Approve inbound access requests, provision workforce seats &amp; assign security permissions"
        icon={Users}
        badgeCount={activeUsers.length}
        badgeLabel="members"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMembershipRequests}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {hasManagePermission && (
              <Button
                size="sm"
                onClick={() => setIsCreateWizardOpen(true)}
                className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Member</span>
              </Button>
            )}
          </>
        }
      />

      {/* Quick Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Members</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{activeUsers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Pending Approval</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{pendingRequests.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Active Members</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {activeUsers.filter((u) => u.status === 'ACTIVE').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Administrators</div>
            <div className="text-lg font-black text-purple-700 leading-tight">
              {activeUsers.filter((u) => u.isTenantAdmin).length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Component */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="active" className="text-xs font-semibold gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Members ({activeUsers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-semibold gap-2 relative">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Requests</span>
            {activePendingCount > 0 && (
              <Badge className="bg-amber-500 text-white font-bold text-[10px] px-1.5 h-4 rounded-full">
                {activePendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACTIVE MEMBERS */}
        <TabsContent value="active" className="space-y-4">
          {/* Filter Bar */}
          <Card className="shadow-none border-slate-200 w-full rounded-[4px]">
            <CardContent className="py-2.5 px-3">
              <div className="flex flex-col md:flex-row items-center gap-2">
                {/* Search Input */}
                <div className="relative w-full md:w-[280px] shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search by name, work email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-8 text-xs h-8 border-slate-200 rounded-[3px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                  <SearchableSelect
                    options={[
                      { value: 'ALL', label: `All Roles (${roles.length})` },
                      ...roles.map((r) => ({
                        value: r.id,
                        label: r.name,
                        badge: r.roleCode,
                        description: r.description,
                      })),
                    ]}
                    value={selectedRoleFilter}
                    onValueChange={(val) => {
                      setSelectedRoleFilter(val);
                      setCurrentPage(1);
                    }}
                    placeholder="All Roles"
                    searchPlaceholder="Search roles..."
                    className="w-[200px]"
                  />

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
                    className="w-[170px]"
                  />

                  {/* Reset Button */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-8 px-2 text-xs text-slate-500 hover:text-red-600 gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset ({activeFiltersCount})</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="shadow-none border-slate-200 w-full overflow-hidden rounded-[4px]">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="text-xs">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Member Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Work Email</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Assigned Role</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading team members from backend...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredActiveUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
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
                        <TableCell className="font-semibold text-slate-900 text-xs py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span>{user.displayName}</span>
                            {user.isTenantAdmin && (
                              <Badge className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0 rounded-[2px]">
                                ADMIN
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono py-2 px-3">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-xs py-2 px-3">
                          {user.isTenantAdmin ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[3px] border border-blue-200 w-fit">
                              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{user.roleName}</span>
                            </div>
                          ) : (
                            <SearchableSelect
                              options={roles.map((r) => ({
                                value: r.id,
                                label: r.name,
                                badge: r.roleCode,
                              }))}
                              value={effectiveRoleId}
                              onValueChange={(val) => handleChangeMemberRole(user.id, val)}
                              placeholder="Select role..."
                              searchPlaceholder="Search roles..."
                              triggerClassName="h-7 text-xs font-semibold rounded-[3px]"
                              className="w-56"
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-xs py-2 px-3">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[3px]">
                            ACTIVE
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono py-2 px-3">
                          {new Date(user.joinedAt).toLocaleDateString('en-US')}
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
          </Card>
        </TabsContent>

        {/* TAB 2: PENDING MEMBERSHIP REQUESTS */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="shadow-none border-slate-200 w-full overflow-hidden rounded-[4px]">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="text-xs">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Requester</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Work Email</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Requested At</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Assign Security Role</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
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
                      <TableCell className="font-semibold text-slate-900 text-xs py-2 px-3">
                        {req.requester.displayName || req.requester.email}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono py-2 px-3">
                        {req.requester.email}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono py-2 px-3">
                        {new Date(req.requestedAt).toLocaleString('en-US')}
                      </TableCell>
                      <TableCell className="text-xs py-2 px-3">
                        <SearchableSelect
                          options={roles.map((r) => ({
                            value: r.id,
                            label: r.name,
                            badge: r.roleCode,
                          }))}
                          value={selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '')}
                          onValueChange={(val) => setSelectedRoleIds((prev) => ({ ...prev, [req.id]: val }))}
                          placeholder="Select role..."
                          searchPlaceholder="Search roles..."
                          triggerClassName="h-7 text-xs font-medium rounded-[3px]"
                          className="w-56"
                        />
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoadingId === req.id}
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-[3px]"
                          >
                            {actionLoadingId === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req)}
                            disabled={actionLoadingId === req.id}
                            className="h-7 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 rounded-[3px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Wizard Modal */}
      <CreateUserWizardModal
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        roles={roles}
        onUserCreated={() => fetchMembershipRequests()}
      />
    </div>
  );
};

export default UsersPage;
