import React, { useState, useEffect, useCallback } from 'react';
import { auditApi, DataAccessLogItem } from '@/services/api/auditApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/common/EmptyState';
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
import { toast } from 'sonner';
import {
  Database,
  RefreshCw,
  Loader2,
  Download,
  Eye,
  Search,
  X,
  RotateCcw,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';

export const DataAccessPage: React.FC = () => {
  const [dataAccess, setDataAccess] = useState<DataAccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditApi.listDataAccess();
      let list = data || [];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (d) =>
            d.dataset.toLowerCase().includes(q) ||
            d.accessedBy.toLowerCase().includes(q) ||
            d.reason.toLowerCase().includes(q)
        );
      }
      if (selectedType !== 'ALL') {
        list = list.filter((d) => d.accessType === selectedType);
      }
      setDataAccess(list);
    } catch {
      toast.error('Không thể tải nhật ký truy cập dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    fetchLogs();
  };

  // KPI Metrics
  const totalExports = dataAccess.filter((d) => d.accessType === 'EXPORT').length;
  const totalViews = dataAccess.filter((d) => d.accessType === 'READ').length;
  const totalRecordsCount = dataAccess.reduce((sum, d) => sum + (((d as any).recordsCount ?? d.recordCount) || 0), 0);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-4.5 h-4.5 text-white" />
            </div>
            Giám sát Truy cập Dữ liệu Nhạy cảm (Data Access)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Theo dõi chi tiết hoạt động đọc, xuất file Excel và chỉnh sửa các tập dữ liệu khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Database className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Lượt Truy Cập</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{dataAccess.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Xuất file Excel</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{totalExports}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Eye className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Truy vấn xem</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">{totalViews}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Lock className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng bản ghi đã đọc</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {totalRecordsCount.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tập dữ liệu, người thực hiện, lý do nghiệp vụ..."
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Select value={selectedType} onValueChange={(val) => setSelectedType(val)}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Loại thao tác" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả thao tác</SelectItem>
                  <SelectItem value="EXPORT">Xuất file Excel</SelectItem>
                  <SelectItem value="READ">Truy vấn xem (Read)</SelectItem>
                  <SelectItem value="UPDATE">Cập nhật (Update)</SelectItem>
                  <SelectItem value="DELETE">Xóa (Delete)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8.5 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Tập dữ liệu truy cập</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Người thực hiện</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Loại thao tác</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Số lượng bản ghi</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Lý do nghiệp vụ</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải nhật ký truy cập dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : dataAccess.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Database}
                      title="Không tìm thấy bản ghi truy cập nào"
                      description="Chưa có thao tác truy cập dữ liệu nhạy cảm nào phù hợp với bộ lọc."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                dataAccess.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    {/* Cột 1: Tập dữ liệu */}
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{d.dataset}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Người thực hiện */}
                    <TableCell>
                      <div className="font-semibold text-slate-800">{d.accessedBy}</div>
                    </TableCell>

                    {/* Cột 3: Loại thao tác */}
                    <TableCell>
                      {d.accessType === 'EXPORT' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px] gap-1">
                          <Download className="w-3 h-3" />
                          <span>Xuất File Excel</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Truy vấn xem ({d.accessType})</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Cột 4: Số lượng bản ghi */}
                    <TableCell className="font-mono text-slate-800 font-bold text-[11px]">
                      {(((d as any).recordsCount ?? d.recordCount) || 0).toLocaleString('vi-VN')} Bản ghi
                    </TableCell>

                    {/* Cột 5: Lý do */}
                    <TableCell className="text-slate-600">
                      {d.reason}
                    </TableCell>

                    {/* Cột 6: Thời gian */}
                    <TableCell className="text-right pr-4 font-mono text-slate-500 text-[11px]">
                      {d.timestamp}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
