import React, { useState, useEffect, useCallback } from 'react';
import { teamApi, TeamItem } from '@/services/api/teamApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar } from '@/components/common/StandardFilterBar';
import {
  Users2,
  Plus,
  RefreshCw,
  Edit,
  Loader2,
  Users,
  Crown,
  Building2,
  UserCheck,
} from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [description, setDescription] = useState('');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamApi.listTeams({ search: searchQuery });
      setTeams(data);
    } catch {
      toast.error('Unable to load department roster');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setCode(`TM-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setLeaderName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: TeamItem) => {
    setEditingTeam(team);
    setCode(team.code || '');
    setName(team.name);
    setLeaderName(team.leaderName || '');
    setDescription(team.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter department / team name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await teamApi.updateTeam(editingTeam.id, {
          version: editingTeam.version || 1,
          name,
          description,
        });
        toast.success('Department updated successfully!');
      } else {
        await teamApi.createTeam({
          code,
          name,
          description,
        });
        toast.success('New department team created successfully!');
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch {
      toast.error('Unable to save department details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + (t.membersCount || 0), 0);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Departments &amp; Functional Teams"
        subtitle="Configure corporate organizational chart, workforce units &amp; appointed team leaders"
        icon={Users2}
        badgeCount={teams.length}
        badgeLabel="teams"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTeams}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Department</span>
            </Button>
          </>
        }
      />

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users2 className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Teams</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{teams.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Assigned Workforce</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{totalMembers} Members</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Crown className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Team Leads</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{teams.length} Leads</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Operational Health</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">100% ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search department by code, title or leader..."
      />

      {/* Teams Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Team Code &amp; Title</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Team Leader</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Team Size</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mission Scope</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading department roster...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Users2}
                      title="No departments found"
                      description="Try adjusting search terms or register a new organizational team."
                      actionLabel="Create Department"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((t) => (
                  <TableRow key={t.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    {/* Code & Name */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.code}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Leader */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{t.leaderName}</span>
                      </div>
                    </TableCell>

                    {/* Size */}
                    <TableCell className="py-2 px-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[11px] rounded-[3px]">
                        {t.membersCount} Members
                      </Badge>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="py-2 px-3 text-slate-600 max-w-xs truncate">
                      {t.description}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2 px-3">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] rounded-[3px]">
                        ACTIVE
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <ActionTooltip label="Edit Team">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(t)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                            aria-label="Edit Team"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create / Edit Team Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingTeam ? 'Edit Department' : 'Create New Department Team'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingTeam ? `Code: ${editingTeam.code}` : 'Define team code and assign designated department lead'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Team Identifier Code *</Label>
              <Input
                placeholder="e.g. SALES_ENT"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-xs border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Department Name *</Label>
              <Input
                placeholder="e.g. Strategic Enterprise Commercial Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Appointed Lead</Label>
              <Input
                placeholder="e.g. Alex Nguyen"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="h-9 text-xs border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mission Description</Label>
              <textarea
                rows={3}
                placeholder="Describe team operational objectives and assigned territory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs border-slate-200 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9 px-4"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingTeam ? 'Save Changes' : 'Create Team'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
