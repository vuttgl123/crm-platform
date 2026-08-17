import React, { useState, useEffect, useCallback } from 'react';
import { mockPlatformApi, TeamItem } from '@/services/mock/mockPlatformData';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Users2,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Loader2,
  Users,
  Crown,
  Building2,
  X,
  RotateCcw,
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
      const data = await mockPlatformApi.listTeams({ search: searchQuery });
      setTeams(data);
    } catch {
      toast.error('Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleResetFilters = () => {
    setSearchQuery('');
    fetchTeams();
  };

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setCode(`TEAM-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setLeaderName('Phạm Tuấn Vũ');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: TeamItem) => {
    setEditingTeam(team);
    setCode(team.code);
    setName(team.name);
    setLeaderName(team.leaderName);
    setDescription(team.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên đội nhóm / phòng ban');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        setTeams((prev) =>
          prev.map((t) => (t.id === editingTeam.id ? { ...t, code, name, leaderName, description } : t))
        );
        toast.success('Đã cập nhật phòng ban thành công!');
      } else {
        await mockPlatformApi.createTeam({
          code,
          name,
          leaderName,
          description,
          status: 'ACTIVE',
        });
        toast.success('Đã tạo phòng ban mới thành công!');
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch {
      toast.error('Không thể lưu phòng ban');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + t.membersCount, 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Users2 className="w-4.5 h-4.5 text-white" />
            </div>
            Phòng ban &amp; Đội nhóm (Teams)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Cấu trúc sơ đồ tổ chức, phân bổ nhân sự và chỉ định trưởng nhóm phụ trách
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTeams}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Phòng ban Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users2 className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng số phòng ban</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{teams.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Nhân sự</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{totalMembers} Thành viên</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Crown className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Trưởng nhóm (Lead)</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{teams.length} Trưởng nhóm</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Trạng thái vận hành</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">100% Hoạt động</div>
          </div>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo mã phòng ban, tên phòng ban hoặc tên trưởng nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-8.5 bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8.5 px-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </Button>
          )}
        </div>
      </Card>

      {/* ── Teams Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Mã &amp; Tên Phòng ban</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trưởng nhóm (Team Leader)</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Quy mô nhân sự</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Mô tả nhiệm vụ</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách phòng ban...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Users2}
                      title="Không tìm thấy phòng ban nào"
                      description="Hãy thử thay đổi điều kiện tìm kiếm hoặc tạo thêm phòng ban mới."
                      actionLabel="Tạo Phòng ban"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    {/* Cột 1: Mã & Tên */}
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{t.code}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Leader */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{t.leaderName}</span>
                      </div>
                    </TableCell>

                    {/* Cột 3: Số nhân sự */}
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[11px]">
                        {t.membersCount} Nhân sự
                      </Badge>
                    </TableCell>

                    {/* Cột 4: Mô tả */}
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {t.description}
                    </TableCell>

                    {/* Cột 5: Trạng thái */}
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                        Đang hoạt động
                      </Badge>
                    </TableCell>

                    {/* Cột 6: Thao tác */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(t)}
                          className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa phòng ban"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Create / Edit Team Modal ── */}
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
                    {editingTeam ? 'Chỉnh sửa Phòng ban' : 'Tạo Phòng ban / Đội nhóm Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingTeam ? `Mã: ${editingTeam.code}` : 'Thiết lập mã phòng ban và chỉ định trưởng nhóm'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mã phòng ban *</Label>
              <Input
                placeholder="VD: SALES_ENT"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-xs border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tên phòng ban *</Label>
              <Input
                placeholder="VD: Khối Kinh doanh Doanh nghiệp Lớn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Trưởng nhóm phụ trách</Label>
              <Input
                placeholder="VD: Phạm Tuấn Vũ"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="h-9 text-xs border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mô tả nhiệm vụ</Label>
              <textarea
                rows={3}
                placeholder="Mô tả phạm vi khách hàng và chức năng phòng ban..."
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
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9 px-4"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingTeam ? 'Lưu Thay Đổi' : 'Tạo Phòng Ban'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
