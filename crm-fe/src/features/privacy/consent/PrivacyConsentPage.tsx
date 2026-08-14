import React, { useState, useEffect } from 'react';
import { mockPrivacyApi, ConsentItem } from '@/services/mock/mockPrivacyData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, RefreshCw, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

export const PrivacyConsentPage: React.FC = () => {
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsents = () => {
    setLoading(true);
    mockPrivacyApi.listConsents().then((data) => {
      setConsents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <span>Đồng thuận Quyền riêng tư (Privacy Consent)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý việc thu thập và rút lại sự đồng ý tiếp thị theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConsents} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải dữ liệu đồng thuận...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Chủ thể Dữ liệu</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mục đích Xử lý Dữ liệu</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thời điểm Cung cấp / Rút lại</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Địa chỉ IP ghi nhận</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái Đồng thuận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {consents.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-bold text-slate-900 text-xs block">{c.contactName}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {c.email}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 max-w-[300px]">
                      {c.purpose}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-600">
                      <div>Đồng ý: {c.grantedAt}</div>
                      {c.revokedAt && <div className="text-rose-600 font-semibold mt-0.5">Đã rút: {c.revokedAt}</div>}
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-[11px] text-slate-500">
                      {c.ipAddress}
                    </TableCell>
                    <TableCell className="text-right pr-5 py-3.5">
                      {c.status === 'GRANTED' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đang đồng thuận</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Đã hủy bỏ</span>
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
