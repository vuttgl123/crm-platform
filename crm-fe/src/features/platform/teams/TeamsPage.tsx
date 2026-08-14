import React, { useState, useEffect, useCallback } from 'react';
import { mockPlatformApi, TeamItem } from '@/services/mock/mockPlatformData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Users2, Search, Plus, RefreshCw, Edit, Loader2, Save, Crown, Users } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenCreate = () => {
    setCode(`TEAM-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setLeaderName('Phạm Tuấn Vũ');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên đội nhóm / phòng ban');
      return;
    }
    await mockPlatformApi.createTeam({
      code,
      name,
      leaderName,
      description,
      status: 'ACTIVE',
    });
    toast.success('Đã tạo phòng ban mới thành công!');
    setIsModalOpen(false);
    fetchTeams();
  };

  const totalMembers = teams.reduce((sum, t) => sum + t.membersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-blue-600" />
            <span>Phòng ban & Đội nhóm (Teams)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cấu trúc sơ đồ tổ chức, phân bổ nhân sự và chỉ định trưởng nhóm phụ trách
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTeams}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phòng ban Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số phòng ban</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{teams.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng nhân sự trực thuộc</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalMembers} Thành viên</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái hoạt động</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">100% Hoạt động</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã phòng ban hoặc tên trưởng nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh sách phòng ban...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã & Tên Phòng ban</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trưởng nhóm (Team Leader)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Quy mô nhân sự</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mô tả nhiệm vụ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {teams.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                        {t.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">{t.name}</span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{t.leaderName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs">
                        {t.membersCount} Nhân sự
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600 max-w-[280px]">
                      {t.description}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                        Đang hoạt động
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Tạo Phòng ban / Đội nhóm Mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Thiết lập mã phòng ban và chỉ định trưởng nhóm phụ trách
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Mã phòng ban *</Label>
              <Input
                placeholder="VD: SALES_ENT"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tên phòng ban *</Label>
              <Input
                placeholder="VD: Khối Kinh doanh Doanh nghiệp Lớn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Trưởng nhóm phụ trách</Label>
              <Input
                placeholder="VD: Phạm Tuấn Vũ"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Mô tả nhiệm vụ</Label>
              <Input
                placeholder="Mô tả phạm vi khách hàng và chức năng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs font-semibold px-4"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Tạo Phòng ban</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
