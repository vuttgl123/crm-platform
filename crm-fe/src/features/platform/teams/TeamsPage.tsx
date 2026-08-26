import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { teamApi, TeamItem } from '@/services/api/teamApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/common/EmptyState';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { TeamEditorSheet } from './components/TeamEditorSheet';
import {
  Users2,
  Plus,
  RotateCcw,
  Edit,
  Loader2,
  Users,
  Crown,
  Building2,
  UserCheck,
  Search,
  X,
  MoreHorizontal,
  Eye,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sheet State
  const [sheetState, setSheetState] = useState<{
    isOpen: boolean;
    mode: 'view' | 'edit' | 'create';
    team: TeamItem | null;
  }>({
    isOpen: false,
    mode: 'view',
    team: null,
  });

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<TeamItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamApi.listTeams({ search: searchQuery });
      setTeams(data || []);
    } catch {
      toast.error('Unable to load department roster from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Filtered & Paginated Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q)) ||
        (t.leaderName && t.leaderName.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && t.status !== 'INACTIVE') ||
        (statusFilter === 'INACTIVE' && t.status === 'INACTIVE');

      const count = t.membersCount || 1;
      const matchesSize =
        sizeFilter === 'ALL' ||
        (sizeFilter === 'SMALL' && count <= 5) ||
        (sizeFilter === 'MEDIUM' && count > 5 && count <= 15) ||
        (sizeFilter === 'LARGE' && count > 15);

      return matchesSearch && matchesStatus && matchesSize;
    });
  }, [teams, searchQuery, statusFilter, sizeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize));
  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeams.slice(start, start + pageSize);
  }, [filteredTeams, currentPage, pageSize]);

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (sizeFilter !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSizeFilter('ALL');
    setCurrentPage(1);
  };

  // Sheet Handlers
  const handleOpenCreate = () => {
    setSheetState({
      isOpen: true,
      mode: 'create',
      team: null,
    });
  };

  const handleOpenView = (team: TeamItem) => {
    setSheetState({
      isOpen: true,
      mode: 'view',
      team,
    });
  };

  const handleOpenEdit = (team: TeamItem) => {
    setSheetState({
      isOpen: true,
      mode: 'edit',
      team,
    });
  };

  const handleCloseSheet = () => {
    setSheetState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveTeam = async (data: {
    id?: string;
    code: string;
    name: string;
    leaderName?: string;
    description?: string;
    version?: number;
  }) => {
    try {
      if (data.id) {
        await teamApi.updateTeam(data.id, {
          version: data.version || 1,
          name: data.name,
          description: data.description,
          leaderId: data.leaderName,
        });
        toast.success(`Department [${data.name}] updated successfully!`);
      } else {
        await teamApi.createTeam({
          code: data.code,
          name: data.name,
          description: data.description,
          leaderId: data.leaderName,
        });
        toast.success(`New department [${data.name}] created successfully!`);
      }
      fetchTeams();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to save department details.';
      toast.error(msg);
      throw err;
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await teamApi.deleteTeam(deleteTarget.id, deleteTarget.version || 1);
      toast.success(`Deleted department [${deleteTarget.name}]!`);
      setDeleteTarget(null);
      fetchTeams();
    } catch {
      toast.error('Failed to delete department.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + (t.membersCount || 0), 0);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Departments & Functional Teams"
        subtitle="Configure corporate organizational chart, workforce units, appointed team leaders, and department scoping."
        badgeCount={teams.length}
        badgeLabel="teams"
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh team directory">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTeams}
                disabled={loading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </ActionTooltip>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 px-3.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Team</span>
            </Button>
          </div>
        }
      />

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Total Teams
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">
              {teams.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Assigned Workforce
            </div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {totalMembers} Members
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Crown className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Appointed Leads
            </div>
            <div className="text-lg font-black text-purple-700 leading-tight">
              {teams.filter((t) => t.leaderName).length} Leads
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-[3px] bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Operational Health
            </div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              100% ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 border border-slate-200 rounded-[4px] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 w-full flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search team by code, title, or leader..."
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

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white min-w-[130px] w-auto">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px] text-xs font-sans">
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
              <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Team Size Filter */}
          <Select
            value={sizeFilter}
            onValueChange={(val) => {
              setSizeFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white min-w-[140px] w-auto">
              <SelectValue placeholder="All Team Sizes" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px] text-xs font-sans">
              <SelectItem value="ALL" className="text-xs">All Team Sizes</SelectItem>
              <SelectItem value="SMALL" className="text-xs">Small (1-5)</SelectItem>
              <SelectItem value="MEDIUM" className="text-xs">Medium (6-15)</SelectItem>
              <SelectItem value="LARGE" className="text-xs">Large (15+)</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
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

      {/* Teams Table */}
      <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans shadow-2xs">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="text-xs">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                Team Code &amp; Title
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                Appointed Leader
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                Workforce Allocation
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                Mission Scope
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Loading department roster from backend...</span>
                </TableCell>
              </TableRow>
            ) : filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-6">
                  <EmptyState
                    icon={Users2}
                    title={searchQuery || activeFiltersCount > 0 ? 'No teams matching filter' : 'No departments found'}
                    description={searchQuery || activeFiltersCount > 0 ? 'Try searching with different keywords or clearing active filters.' : 'Get started by creating your first organizational workforce unit.'}
                    actionLabel={activeFiltersCount > 0 ? undefined : 'New Department'}
                    onAction={activeFiltersCount > 0 ? undefined : handleOpenCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedTeams.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs"
                >
                  {/* Code & Name */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenView(t)}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left cursor-pointer block"
                        >
                          {t.name}
                        </button>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-[2px]">
                          {t.code || t.teamCode}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Leader */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{t.leaderName || 'Unassigned'}</span>
                    </div>
                  </TableCell>

                  {/* Size */}
                  <TableCell className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px] rounded-[2px]"
                    >
                      {t.membersCount || 1} Members
                    </Badge>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                    {t.description || 'General organizational workforce unit'}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                    >
                      ACTIVE
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-2.5 px-3 text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[3px] text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          aria-label={`Actions for ${t.name}`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-[3px] text-xs font-sans">
                        <DropdownMenuItem
                          onClick={() => handleOpenView(t)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(t)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Team</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(t)}
                          className="gap-2 cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Team</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Standard Pagination */}
        {!loading && filteredTeams.length > 0 && (
          <StandardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={filteredTeams.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="teams"
          />
        )}
      </div>

      {/* Slide-over Team Drawer (View / Edit / Create) */}
      <TeamEditorSheet
        isOpen={sheetState.isOpen}
        mode={sheetState.mode}
        team={sheetState.team}
        onClose={handleCloseSheet}
        onSwitchMode={(mode) => setSheetState((prev) => ({ ...prev, mode }))}
        onSaveTeam={handleSaveTeam}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertCircle className="w-5 h-5" />
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Delete department team?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete department{' '}
              <strong className="text-slate-900">{deleteTarget?.name}</strong> (
              <span className="font-mono text-slate-700">{deleteTarget?.code}</span>)? This action will remove team-based scoping associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-8 text-xs font-semibold rounded-[3px] border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Delete Team</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamsPage;
