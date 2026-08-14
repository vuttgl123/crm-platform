import React, { useState, useEffect } from 'react';
import { mockAuditApi, DataAccessLogItem } from '@/services/mock/mockAuditData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, RefreshCw, Loader2, Download, Eye } from 'lucide-react';

export const DataAccessPage: React.FC = () => {
  const [dataAccess, setDataAccess] = useState<DataAccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    mockAuditApi.listDataAccess().then((data) => {
      setDataAccess(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            <span>Giám sát Truy cập Dữ liệu Nhạy cảm (Data Access)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi chi tiết hoạt động đọc, xuất file Excel và chỉnh sửa các tập dữ liệu khách hàng
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải nhật ký truy cập...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Tập dữ liệu truy cập</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Người thực hiện</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Loại thao tác</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Số lượng bản ghi</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Lý do nghiệp vụ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {dataAccess.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5 font-bold text-slate-900 text-xs">
                      {d.dataset}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-800 font-semibold">
                      {d.accessedBy}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {d.accessType === 'EXPORT' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs gap-1">
                          <Download className="w-3 h-3" />
                          <span>Xuất File Excel</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Truy vấn xem</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-bold text-slate-700">
                      {d.recordsCount} Bản ghi
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-600">
                      {d.reason}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-400 text-right pr-5">
                      {d.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
