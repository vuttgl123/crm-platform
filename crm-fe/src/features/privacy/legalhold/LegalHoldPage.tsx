import React, { useState, useEffect } from 'react';
import { mockPrivacyApi, LegalHoldItem } from '@/services/mock/mockPrivacyData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, RefreshCw, Loader2, Lock } from 'lucide-react';

export const LegalHoldPage: React.FC = () => {
  const [holds, setHolds] = useState<LegalHoldItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolds = () => {
    setLoading(true);
    mockPrivacyApi.listLegalHolds().then((data) => {
      setHolds(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-blue-600" />
            <span>Đình chỉ Tiêu hủy Phục vụ Pháp lý (Legal Hold)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đóng băng và bảo lưu chứng cứ dữ liệu phục vụ điều tra, tố tụng hoặc thanh tra pháp luật
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHolds} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải lệnh Legal Hold...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Vụ việc & Mã Hồ sơ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Đơn vị Giám sát (Custodian)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Phạm vi Dữ liệu Đóng băng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Ngày ban hành</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái Khóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {holds.map((h) => (
                  <TableRow key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block mb-1">
                        {h.matterNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-xs block">{h.caseName}</span>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs font-semibold text-slate-800">
                      {h.custodian}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-600 max-w-[300px]">
                      {h.scope}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-500">
                      {h.createdAt}
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Đang đóng băng</span>
                      </Badge>
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
