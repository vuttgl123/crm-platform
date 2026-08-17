import React, { useState, useEffect } from 'react';
import { privacyApi, DsrItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, RefreshCw, Loader2, CheckCircle2, Clock, Mail } from 'lucide-react';

export const DataSubjectRequestsPage: React.FC = () => {
  const [dsrList, setDsrList] = useState<DsrItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDsr = () => {
    setLoading(true);
    privacyApi.listDsr().then((data) => {
      setDsrList(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDsr();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-blue-600" />
            <span>Yêu cầu từ Chủ thể Dữ liệu (DSR)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận và xử lý quyền trích xuất dữ liệu, chỉnh sửa thông tin hoặc quyền được lãng quên (Erasure)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDsr} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải yêu cầu DSR...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã Phiếu & Người yêu cầu</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Loại Yêu cầu Quyền</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Ngày tiếp nhận</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Ngày hoàn tất</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái Xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {dsrList.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                        {d.ticketNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">{d.requesterName}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {d.email}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      {d.requestType === 'EXPORT_DATA' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs">
                          Trích xuất Dữ liệu (Export)
                        </Badge>
                      )}
                      {d.requestType === 'ERASURE' && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs">
                          Quyền được lãng quên (Erasure)
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600">
                      {d.requestedAt}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600">
                      {d.completedAt || '—'}
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      {d.status === 'COMPLETED' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã hoàn thành</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Đang thẩm định</span>
                        </Badge>
                      )}
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
